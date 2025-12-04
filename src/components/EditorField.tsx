// src/components/EditorField.tsx

import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { type FormField, ItemTypes } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, GripVertical } from "lucide-react";

interface EditorFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  isNested?: boolean;
  parentPanelId?: string;
}

export const EditorField: React.FC<EditorFieldProps> = ({
  field,
  index,
  moveField,
  updateField,
  removeField,
  isSelected,
  onSelect,
  isNested = false,
  parentPanelId,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: {
      type: ItemTypes.FIELD,
      index,
      id: field.id,
      isNested,
      parentPanelId,
      fieldData: field,
      isPanel: false, // Mark as regular field, not panel
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: ItemTypes.FIELD,
    hover: (item: any) => {
      if (isNested) return; // Don't reorder inside panels
      if (!ref.current) return;
      if (item.index === undefined || item.index === index) return;
      if (item.isNested) return; // Don't reorder if dragging from panel
      if (item.isPanel) return; // Don't reorder when dragging panels

      const dragIndex = item.index;
      const hoverIndex = index;
      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
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

  const getLabelStyle = () => ({
    fontWeight: field.labelBold ? "bold" : "normal",
    fontStyle: field.labelItalic ? "italic" : "normal",
    textDecoration: field.labelUnderline ? "underline" : "none",
    fontSize: `${field.labelSize || 14}px`,
  });

  const formatDateValue = (dateValue: string) => {
    if (!dateValue || !field.dateFormat) return dateValue;

    const date = new Date(dateValue);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    switch (field.dateFormat) {
      case "DD/MM/YYYY":
        return `${day}/${month}/${year}`;
      case "MM/DD/YYYY":
        return `${month}/${day}/${year}`;
      case "DD-MM-YYYY":
        return `${day}-${month}-${year}`;
      case "MM-DD-YYYY":
        return `${month}-${day}-${year}`;
      case "YYYY-MM-DD":
      default:
        return `${year}-${month}-${day}`;
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
        isSelected ? "ring-2 ring-blue-500 shadow-lg" : "border border-gray-200"
      } ${
        isDragging ? "opacity-30" : ""
      } p-4 rounded-lg bg-white mb-3 transition-all relative group hover:shadow-md`}
      style={{
        width: field.width === "custom" ? field.customWidth : undefined,
      }}
    >
      {/* Drag Handle */}
      {!isNested && (
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
          <GripVertical size={20} className="text-gray-400" />
        </div>
      )}

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeField(field.id);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white hover:bg-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
        title="Remove field"
      >
        <Trash2 size={14} />
      </button>

      {/* Label */}
      {field.showLabel !== false && field.type !== "description" && (
        <label
          className="block mb-2 font-medium text-gray-700"
          style={getLabelStyle()}
        >
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Field Renderers */}
      {field.type === "text" && (
        <Input
          value={field.value || ""}
          onChange={(e) => updateField(field.id, { value: e.target.value })}
          placeholder={field.placeholder}
          className={
            field.underline ? "border-b border-t-0 border-x-0 rounded-none" : ""
          }
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {field.type === "description" && (
        <Textarea
          value={field.content || ""}
          onChange={(e) => updateField(field.id, { content: e.target.value })}
          className="bg-yellow-50 border-yellow-200"
          rows={3}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {field.type === "radio" && (
        <div
          className={`${
            field.layoutDirection === "row"
              ? "flex flex-wrap gap-4"
              : field.layoutDirection === "grid"
              ? "grid gap-3"
              : "space-y-2"
          }`}
          style={{
            gridTemplateColumns:
              field.layoutDirection === "grid"
                ? `repeat(${field.gridColumns || 2}, 1fr)`
                : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {field.options?.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
            >
              <input
                type="radio"
                name={field.id}
                value={opt.value}
                checked={field.value === opt.value}
                onChange={() => updateField(field.id, { value: opt.value })}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "checkbox" && (
        <div
          className={`${
            field.layoutDirection === "row"
              ? "flex flex-wrap gap-4"
              : field.layoutDirection === "grid"
              ? "grid gap-3"
              : "space-y-2"
          }`}
          style={{
            gridTemplateColumns:
              field.layoutDirection === "grid"
                ? `repeat(${field.gridColumns || 2}, 1fr)`
                : undefined,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {field.options?.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors"
            >
              <input
                type="checkbox"
                value={opt.value}
                checked={
                  Array.isArray(field.value) && field.value.includes(opt.value)
                }
                onChange={(e) => {
                  const currentValues = Array.isArray(field.value)
                    ? field.value
                    : [];
                  const newValues = e.target.checked
                    ? [...currentValues, opt.value]
                    : currentValues.filter((v) => v !== opt.value);
                  updateField(field.id, { value: newValues });
                }}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      )}

      {field.type === "select" && (
        <Select
          value={field.value || ""}
          onValueChange={(value) => updateField(field.id, { value })}
        >
          <SelectTrigger onClick={(e) => e.stopPropagation()}>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((opt, idx) => (
              <SelectItem key={idx} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {field.type === "date" && (
        <div onClick={(e) => e.stopPropagation()}>
          <Input
            type="date"
            value={field.value || ""}
            onChange={(e) => updateField(field.id, { value: e.target.value })}
          />
          {field.value && (
            <p className="text-xs text-gray-500 mt-1">
              Formatted: {formatDateValue(field.value)}
            </p>
          )}
        </div>
      )}

      {field.type === "signature" && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg h-24 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
          <span className="text-xs text-gray-400 font-medium">
            (Signature Area)
          </span>
        </div>
      )}

      {/* Helper Text */}
      {field.helperText && (
        <p className="text-xs text-gray-500 mt-2 italic">{field.helperText}</p>
      )}
    </div>
  );
};
