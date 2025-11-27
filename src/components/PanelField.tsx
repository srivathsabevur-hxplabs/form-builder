// src/components/PanelField.tsx
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { type FormField, ItemTypes, type FieldType } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { EditorField } from "@/components/EditorField";

interface PanelFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  onSelectChild: (childId: string) => void;
  addFieldToPanel: (panelId: string, type: FieldType) => void;
}

export const PanelField = ({
  field,
  index,
  moveField,
  updateField,
  removeField,
  isSelected,
  onSelect,
  onSelectChild,
  addFieldToPanel,
}: PanelFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: [ItemTypes.FIELD, ItemTypes.TOOL],
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: monitor.isOver({ shallow: true }),
      };
    },
    hover(item: any, monitor) {
      if (monitor.getItemType() === ItemTypes.FIELD) {
        if (!ref.current) return;
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;
        moveField(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
    },
    drop(item: any, monitor) {
      // Check if the drop was handled by a child
      if (monitor.didDrop()) {
        return;
      }

      if (monitor.getItemType() === ItemTypes.TOOL) {
        addFieldToPanel(field.id, item.type);
        return { handled: true };
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      return { id: field.id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const getPaddingClass = () => {
    switch (field.padding) {
      case "none":
        return "p-0";
      case "small":
        return "p-2";
      case "large":
        return "p-8";
      default:
        return "p-4";
    }
  };

  const getWidthClass = () => {
    switch (field.panelWidth) {
      case "half":
        return "w-1/2";
      case "third":
        return "w-1/3";
      case "two-thirds":
        return "w-2/3";
      case "quarter":
        return "w-1/4";
      case "custom":
        return "";
      default:
        return "w-full";
    }
  };

  const getGridColumns = () => {
    const cols = field.columnsPerRow || 1;
    return `repeat(${cols}, minmax(0, 1fr))`;
  };

  return (
    <div
      ref={ref}
      style={{
        opacity: isDragging ? 0.5 : 1,
        width:
          field.panelWidth === "custom"
            ? `${field.customWidth || 100}%`
            : undefined,
        backgroundColor: field.backgroundColor || "#ffffff",
        borderColor: field.borderColor || "#e5e7eb",
      }}
      data-handler-id={handlerId}
      onMouseDown={(e) => {
        if (
          !(e.target as HTMLElement).closest("input, textarea, button, select")
        ) {
          onSelect();
        }
      }}
      className={`${getWidthClass()} border-2 rounded-lg relative group transition-all mb-4 cursor-move ${
        isSelected
          ? "ring-4 ring-blue-400 border-blue-400 shadow-lg"
          : "border-gray-300 hover:border-gray-400"
      } ${isOver ? "ring-2 ring-green-400 bg-green-50" : ""}`}
    >
      <div className="flex items-center justify-between p-3 border-b bg-gray-100 rounded-t-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-700 uppercase">
            Panel
          </span>
          <span className="text-xs text-gray-500">
            ({field.children?.length || 0} field
            {field.children?.length !== 1 ? "s" : ""})
          </span>
        </div>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-red-500 hover:bg-red-100"
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className={getPaddingClass()}>
        {field.children && field.children.length > 0 ? (
          <div
            className="gap-4"
            style={{
              display: "grid",
              gridTemplateColumns: getGridColumns(),
            }}
          >
            {field.children.map((childField, childIndex) => (
              <EditorField
                key={childField.id}
                field={childField}
                index={childIndex}
                moveField={() => {}}
                updateField={updateField}
                removeField={removeField}
                isSelected={false}
                onSelect={() => onSelectChild(childField.id)}
                isNested={true}
              />
            ))}
          </div>
        ) : (
          <div
            className={`text-center py-16 text-gray-400 border-2 border-dashed rounded-lg transition-colors ${
              isOver ? "border-green-400 bg-green-50" : "border-gray-300"
            }`}
          >
            <p className="text-sm font-semibold">Drop fields here</p>
            <p className="text-xs mt-1">
              Drag components from the left sidebar into this panel
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
