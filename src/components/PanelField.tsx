// src/components/PanelField.tsx

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { type FormField, ItemTypes, type FieldType } from "@/types";
import { EditorField } from "@/components/EditorField";
import { Trash2, Package } from "lucide-react";

interface PanelFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  onSelectChild: (childId: string) => void;
  addFieldToPanel: (panelId: string, fieldData: FormField) => void;
  removeFieldFromPanel: (panelId: string, fieldId: string) => void;
  selectedChildId?: string;
}

export const PanelField: React.FC<PanelFieldProps> = ({
  field,
  index,
  moveField,
  updateField,
  removeField,
  isSelected,
  onSelect,
  onSelectChild,
  addFieldToPanel,
  removeFieldFromPanel,
  selectedChildId,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: { type: ItemTypes.FIELD, index, id: field.id, isPanel: true },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: [ItemTypes.TOOL, ItemTypes.FIELD],
    canDrop: (item: any) => {
      // Only allow tools or nested fields to be dropped into panel
      // Don't allow panels to be dropped into panels
      if (item.type === ItemTypes.FIELD && item.isPanel) {
        return false;
      }
      return true;
    },
    hover: (item: any, monitor) => {
      if (!ref.current) return;

      // Only reorder if it's a PANEL being dragged over another PANEL
      if (
        item.type === ItemTypes.FIELD &&
        item.isPanel &&
        item.index !== undefined &&
        item.index !== index
      ) {
        const dragIndex = item.index;
        const hoverIndex = index;
        if (dragIndex === hoverIndex) return;

        moveField(dragIndex, hoverIndex);
        item.index = hoverIndex;
      }
      // Don't do anything for regular fields being dragged - let drop handle it
    },
    drop: (item: any, monitor) => {
      // Only handle if not already handled by nested components
      if (monitor.didDrop()) return;

      // Handle field dropped into panel
      if (item.type === ItemTypes.FIELD && item.fieldData && !item.isPanel) {
        addFieldToPanel(field.id, item.fieldData);
        return { handled: true };
      }

      // Handle tool dropped into panel
      if (
        item.type &&
        typeof item.type === "string" &&
        item.type !== ItemTypes.FIELD
      ) {
        const newFieldData: FormField = {
          id: crypto.randomUUID(),
          type: item.type as FieldType,
          label: `New ${item.type} Field`,
          value: item.type === "checkbox" ? [] : "",
          showLabel: true,
          width: "full",
        };
        addFieldToPanel(field.id, newFieldData);
        return { handled: true };
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const getWidthClass = () => {
    switch (field.width) {
      case "half":
        return "w-1/2";
      case "third":
        return "w-1/3";
      case "quarter":
        return "w-1/4";
      case "custom":
        return "";
      default:
        return "w-full";
    }
  };

  const getLayoutStyle = () => {
    const cols = field.columnsPerRow || 2;

    if (field.rowsLayout) {
      return {
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: "1rem",
      };
    } else {
      return {
        display: "flex",
        flexDirection: "column" as const,
        gap: "1rem",
      };
    }
  };

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      className={`${getWidthClass()} ${
        isSelected ? "ring-2 ring-blue-500 shadow-xl" : "border-2"
      } ${isDragging ? "opacity-30" : ""} ${
        isOver && canDrop ? "ring-2 ring-green-400 bg-green-50" : ""
      } rounded-xl mb-4 transition-all cursor-move group hover:shadow-lg bg-white overflow-hidden`}
      style={{
        width: field.width === "custom" ? field.customWidth : undefined,
        borderColor: field.borderColor || "#e5e7eb",
      }}
    >
      {/* Panel Header */}
      {field.showPanelLabel !== false && (
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ backgroundColor: field.backgroundColor || "#f9fafb" }}
        >
          <div className="flex items-center gap-2">
            <Package size={18} className="text-gray-600" />
            <span className="font-semibold text-base text-gray-800">
              {field.label || "Panel"}
            </span>
            <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border">
              {field.children?.length || 0}{" "}
              {field.children?.length === 1 ? "field" : "fields"}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeField(field.id);
            }}
            className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
            title="Remove panel"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      {/* Panel Children */}
      <div
        style={{
          ...getLayoutStyle(),
          padding: `${field.padding || 16}px`,
        }}
      >
        {field.children && field.children.length > 0 ? (
          field.children.map((child, childIndex) => (
            <EditorField
              key={child.id}
              field={child}
              index={childIndex}
              moveField={() => {}}
              updateField={updateField}
              removeField={() => removeFieldFromPanel(field.id, child.id)}
              isSelected={selectedChildId === child.id}
              onSelect={() => onSelectChild(child.id)}
              isNested={true}
              parentPanelId={field.id}
            />
          ))
        ) : (
          <div
            className={`w-full text-center py-20 border-2 border-dashed rounded-xl transition-all ${
              isOver && canDrop
                ? "border-green-400 bg-green-100 scale-105"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <Package size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              Drop fields here
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Drag controls from sidebar or move fields from form
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
