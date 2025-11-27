// src/components/EditorField.tsx
import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { type FormField, ItemTypes } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Eye, EyeOff, Underline, Plus } from "lucide-react";

interface EditorFieldProps {
  field: FormField;
  index: number;
  moveField: (dragIndex: number, hoverIndex: number) => void;
  updateField: (id: string, updates: Partial<FormField>) => void;
  removeField: (id: string) => void;
  isSelected: boolean;
  onSelect: () => void;
  isNested?: boolean;
}

export const EditorField = ({
  field,
  index,
  moveField,
  updateField,
  removeField,
  isSelected,
  onSelect,
  isNested = false,
}: EditorFieldProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.FIELD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: any, monitor) {
      if (isNested) return;

      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveField(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.FIELD,
    item: () => {
      return { id: field.id, index };
    },
    canDrag: !isNested,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  if (!isNested) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  const addTableColumn = () => {
    if (!field.columns) return;
    const newColId = `c${field.columns.length + 1}`;
    const newCols = [
      ...field.columns,
      { id: newColId, header: "New Col", width: "20%" },
    ];
    const newData = field.tableData?.map((row) => ({
      ...row,
      [newColId]: "",
    })) || [{ [newColId]: "" }];
    updateField(field.id, { columns: newCols, tableData: newData });
  };

  const addTableRow = () => {
    if (!field.columns || !field.tableData) return;
    const empty: any = {};
    field.columns.forEach((c) => (empty[c.id] = ""));
    updateField(field.id, { tableData: [...field.tableData, empty] });
  };

  const updateTableData = (rowIndex: number, colId: string, val: string) => {
    if (!field.tableData) return;
    const newData = [...field.tableData];
    newData[rowIndex] = { ...newData[rowIndex], [colId]: val };
    updateField(field.id, { tableData: newData });
  };

  const getFieldSizeClass = () => {
    switch (field.fieldSize) {
      case "small":
        return "h-8 text-sm";
      case "large":
        return "h-12 text-lg";
      default:
        return "h-10";
    }
  };

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-handler-id={handlerId}
      onMouseDown={(e) => {
        if (
          !(e.target as HTMLElement).closest("input, textarea, button, select")
        ) {
          onSelect();
        }
      }}
      className={`p-4 border-2 rounded-lg bg-white shadow-sm relative group transition-all ${
        isNested ? "cursor-default" : "cursor-move"
      } ${
        field.borderBottom ? "mb-6 pb-6 border-b-4 border-b-gray-300" : "mb-4"
      } ${
        isSelected
          ? "ring-4 ring-blue-400 border-blue-400"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-white shadow-lg border rounded p-1 z-10 transition">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateField(field.id, { showLabel: !field.showLabel });
          }}
          title="Toggle Label"
          className="p-1 hover:bg-gray-100 rounded"
        >
          {field.showLabel !== false ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateField(field.id, { borderBottom: !field.borderBottom });
          }}
          title="Border"
          className="px-1 text-xs hover:bg-gray-100 rounded"
        >
          _
        </button>
        {field.type === "text" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              updateField(field.id, { underline: !field.underline });
            }}
            title="Underline"
            className="p-1 hover:bg-gray-100 rounded"
          >
            <Underline size={12} />
          </button>
        )}
        <button
          className="text-red-500 p-1 hover:bg-red-50 rounded"
          onClick={(e) => {
            e.stopPropagation();
            removeField(field.id);
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>

      {field.showLabel !== false && (
        <div className="mb-3">
          <label
            className="block mb-1"
            style={{
              fontWeight: field.labelBold ? "bold" : "normal",
              fontStyle: field.labelItalic ? "italic" : "normal",
              textDecoration: field.labelUnderline ? "underline" : "none",
              fontSize: `${field.labelSize || 14}px`,
            }}
          >
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        </div>
      )}

      {field.type === "text" && (
        <Input
          placeholder={field.placeholder || "Enter text"}
          value={field.value || ""}
          onChange={(e) => updateField(field.id, { value: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`${getFieldSizeClass()} ${
            field.underline
              ? "border-b-2 border-black rounded-none border-x-0 border-t-0 px-0"
              : ""
          }`}
        />
      )}

      {field.type === "description" && (
        <Textarea
          value={field.content || ""}
          onChange={(e) => updateField(field.id, { content: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className="bg-yellow-50 text-sm min-h-[100px]"
          placeholder="Enter description text..."
        />
      )}

      {field.type === "radio" && field.options && (
        <div onClick={(e) => e.stopPropagation()}>
          <div
            className="gap-3"
            style={{
              display: field.direction === "row" ? "flex" : "grid",
              flexWrap: field.direction === "row" ? "wrap" : undefined,
              gridTemplateColumns:
                field.direction === "grid"
                  ? `repeat(${field.gridColumns || 2}, minmax(0, 1fr))`
                  : "1fr",
            }}
          >
            {field.options.map((opt, i) => {
              let prefix = "";
              if (field.listStyle === "numbered") prefix = `${i + 1}. `;
              if (field.listStyle === "alpha")
                prefix = `${String.fromCharCode(65 + i)}. `;

              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      field.value === opt
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400"
                    }`}
                  >
                    {field.value === opt && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <span className="text-sm">
                    {prefix}
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {field.type === "checkbox" && field.options && (
        <div onClick={(e) => e.stopPropagation()}>
          <div
            className="gap-3"
            style={{
              display: field.direction === "row" ? "flex" : "grid",
              flexWrap: field.direction === "row" ? "wrap" : undefined,
              gridTemplateColumns:
                field.direction === "grid"
                  ? `repeat(${field.gridColumns || 2}, minmax(0, 1fr))`
                  : "1fr",
            }}
          >
            {field.options.map((opt, i) => {
              const isChecked =
                Array.isArray(field.value) && field.value.includes(opt);
              let prefix = "";
              if (field.listStyle === "numbered") prefix = `${i + 1}. `;
              if (field.listStyle === "alpha")
                prefix = `${String.fromCharCode(65 + i)}. `;

              return (
                <div key={i} className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 border-2 rounded ${
                      isChecked
                        ? "bg-blue-600 border-blue-600"
                        : "border-gray-400"
                    }`}
                  />
                  <span className="text-sm">
                    {prefix}
                    {opt}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {field.type === "select" && field.options && (
        <div onClick={(e) => e.stopPropagation()}>
          <Select
            value={field.value}
            onValueChange={(v) => updateField(field.id, { value: v })}
          >
            <SelectTrigger className={getFieldSizeClass()}>
              <SelectValue placeholder="Select an option..." />
            </SelectTrigger>
            <SelectContent>
              {field.options.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {field.type === "date" && (
        <Input
          type="date"
          value={field.value || ""}
          onChange={(e) => updateField(field.id, { value: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={getFieldSizeClass()}
        />
      )}

      {field.type === "signature" && (
        <div className="border-b-2 border-black h-24 flex items-end text-gray-400 text-xs p-2">
          (Signature Area)
        </div>
      )}

      {field.type === "dynamic-table" && field.columns && (
        <div
          className="overflow-x-auto border rounded bg-white mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                {field.columns.map((col) => (
                  <th
                    key={col.id}
                    className="border-r p-2 text-left font-semibold min-w-[100px]"
                  >
                    <input
                      className="bg-transparent w-full outline-none font-semibold"
                      value={col.header}
                      onChange={(e) => {
                        const newCols = field.columns!.map((c) =>
                          c.id === col.id ? { ...c, header: e.target.value } : c
                        );
                        updateField(field.id, { columns: newCols });
                      }}
                    />
                  </th>
                ))}
                <th className="p-2 w-10">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={addTableColumn}
                  >
                    <Plus size={14} />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody>
              {field.tableData?.map((row, rIndex) => (
                <tr key={rIndex} className="border-b last:border-0">
                  {field.columns!.map((col) => (
                    <td key={col.id} className="border-r p-1 align-top">
                      <input
                        className="w-full h-full p-1 outline-none bg-transparent"
                        value={row[col.id] || ""}
                        onChange={(e) =>
                          updateTableData(rIndex, col.id, e.target.value)
                        }
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-2 bg-gray-50">
            <Button size="sm" variant="outline" onClick={addTableRow}>
              Add Row
            </Button>
          </div>
        </div>
      )}

      {field.helperText && (
        <p className="text-xs text-gray-500 mt-2 italic">{field.helperText}</p>
      )}
    </div>
  );
};
