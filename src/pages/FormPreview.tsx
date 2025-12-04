// src/pages/FormPreview.tsx

import React, { useState } from "react";
import { type FormField } from "@/types";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormPreviewProps {
  title: string;
  fields: FormField[];
  onClose: () => void;
}

export const FormPreview: React.FC<FormPreviewProps> = ({
  title,
  fields,
  onClose,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const renderField = (field: FormField) => {
    const getLabelStyle = () => ({
      fontWeight: field.labelBold ? "bold" : "normal",
      fontStyle: field.labelItalic ? "italic" : "normal",
      textDecoration: field.labelUnderline ? "underline" : "none",
      fontSize: `${field.labelSize || 14}px`,
    });

    return (
      <div key={field.id} className="mb-4">
        {field.showLabel !== false && field.type !== "description" && (
          <label className="block mb-2 text-gray-700" style={getLabelStyle()}>
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {field.type === "text" && (
          <Input
            placeholder={field.placeholder}
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
          />
        )}

        {field.type === "description" && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <p className="text-sm text-gray-700">{field.content}</p>
          </div>
        )}

        {field.type === "radio" && (
          <div
            className={`${
              field.layoutDirection === "row"
                ? "flex gap-4"
                : field.layoutDirection === "grid"
                ? "grid gap-2"
                : "space-y-2"
            }`}
            style={{
              gridTemplateColumns:
                field.layoutDirection === "grid"
                  ? `repeat(${field.gridColumns || 2}, 1fr)`
                  : undefined,
            }}
          >
            {field.options?.map((opt, idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value={opt.value}
                  checked={formData[field.id] === opt.value}
                  onChange={() =>
                    setFormData({ ...formData, [field.id]: opt.value })
                  }
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
                ? "flex gap-4"
                : field.layoutDirection === "grid"
                ? "grid gap-2"
                : "space-y-2"
            }`}
            style={{
              gridTemplateColumns:
                field.layoutDirection === "grid"
                  ? `repeat(${field.gridColumns || 2}, 1fr)`
                  : undefined,
            }}
          >
            {field.options?.map((opt, idx) => {
              const currentValues = Array.isArray(formData[field.id])
                ? formData[field.id]
                : [];
              return (
                <label key={idx} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={currentValues.includes(opt.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, opt.value]
                        : currentValues.filter((v: string) => v !== opt.value);
                      setFormData({ ...formData, [field.id]: newValues });
                    }}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {field.type === "select" && (
          <Select
            value={formData[field.id] || ""}
            onValueChange={(value) =>
              setFormData({ ...formData, [field.id]: value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
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
          <Input
            type="date"
            value={formData[field.id] || ""}
            onChange={(e) =>
              setFormData({ ...formData, [field.id]: e.target.value })
            }
          />
        )}

        {field.type === "signature" && (
          <div className="border-2 border-dashed h-24 flex items-center justify-center text-gray-400 text-sm">
            Signature
          </div>
        )}

        {field.helperText && (
          <p className="text-xs text-gray-500 mt-1">{field.helperText}</p>
        )}
      </div>
    );
  };

  const renderPanel = (panel: FormField) => {
    return (
      <div
        key={panel.id}
        className="mb-6 border rounded-lg"
        style={{
          borderColor: panel.borderColor || "#e5e7eb",
        }}
      >
        {panel.showPanelLabel !== false && panel.label && (
          <div
            className="px-4 py-3 border-b font-semibold"
            style={{
              backgroundColor: panel.backgroundColor || "#f9fafb",
            }}
          >
            {panel.label}
          </div>
        )}
        <div style={{ padding: `${panel.padding || 16}px` }}>
          {panel.rowsLayout ? (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns: `repeat(${panel.columnsPerRow || 2}, 1fr)`,
              }}
            >
              {panel.children?.map((child) => renderField(child))}
            </div>
          ) : (
            <div className="space-y-4">
              {panel.children?.map((child) => renderField(child))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Simple Header */}
      <div className="border-b px-6 py-4 flex items-center justify-between bg-white">
        <h2 className="text-xl font-bold">Preview</h2>
        <Button onClick={onClose} variant="ghost" size="icon">
          <X size={20} />
        </Button>
      </div>

      {/* Content */}
      <div className="h-[calc(100vh-73px)] overflow-y-auto bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold mb-6">{title}</h1>

          <div>
            {fields.map((field) =>
              field.type === "panel" ? renderPanel(field) : renderField(field)
            )}
          </div>

          {fields.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <Button
                onClick={() => {
                  console.log("Form Data:", formData);
                  alert("Form submitted!");
                }}
              >
                Submit
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
