// src/pages/Editor.tsx

import React, { useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import { type FormField, ItemTypes, type FieldType } from "@/types";
import { EditorField } from "@/components/EditorField";
import { PanelField } from "@/components/PanelField";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { FormPreview } from "@/pages/FormPreview";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const Editor = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [title, setTitle] = useState("My Drag & Drop Form");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const getSelectedField = (): FormField | null => {
    const topLevel = fields.find((f) => f.id === selectedFieldId);
    if (topLevel) return topLevel;

    for (const field of fields) {
      if (field.type === "panel" && field.children) {
        const nested = field.children.find((c) => c.id === selectedFieldId);
        if (nested) return nested;
      }
    }
    return null;
  };

  const selectedField = getSelectedField();

  const createBaseField = (type: FieldType): FormField => {
    const baseField: FormField = {
      id: crypto.randomUUID(),
      type,
      label: `New ${type} Field`,
      value: type === "checkbox" ? [] : "",
      showLabel: true,
      labelBold: false,
      labelItalic: false,
      labelUnderline: false,
      labelSize: 14,
      underline: false,
      borderBottom: false,
      required: false,
      width: "full",
      dateFormat: type === "date" ? "MM/DD/YYYY" : undefined,
    };

    if (type === "panel") {
      return {
        ...baseField,
        label: "Panel Container",
        columnsPerRow: 2,
        rowsLayout: true,
        children: [],
        backgroundColor: "#f9fafb",
        borderColor: "#e5e7eb",
        padding: 16,
        showPanelLabel: true,
      };
    } else if (["radio", "checkbox", "select"].includes(type)) {
      return {
        ...baseField,
        options: [
          { label: "Option 1", value: "option_1" },
          { label: "Option 2", value: "option_2" },
          { label: "Option 3", value: "option_3" },
        ],
        layoutDirection: ["radio", "checkbox"].includes(type)
          ? "column"
          : undefined,
        gridColumns: 2,
      };
    } else if (type === "description") {
      return {
        ...baseField,
        content: "Enter your description here...",
      };
    }

    return baseField;
  };

  const addField = useCallback((type: FieldType) => {
    const newField = createBaseField(type);
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, []);

  const addFieldToPanel = useCallback(
    (panelId: string, fieldData: FormField) => {
      setFields((prev) => {
        // Remove field from its current location
        let fieldToAdd = fieldData;
        let fieldExists = false;

        // Check if field exists at top level
        const topLevelField = prev.find((f) => f.id === fieldData.id);
        if (topLevelField) {
          fieldToAdd = topLevelField;
          fieldExists = true;
        }

        // Check if field exists in any panel
        for (const field of prev) {
          if (field.type === "panel" && field.children) {
            const childField = field.children.find(
              (c) => c.id === fieldData.id
            );
            if (childField) {
              fieldToAdd = childField;
              fieldExists = true;
              break;
            }
          }
        }

        // Remove from all locations
        let newFields = prev.filter((f) => f.id !== fieldData.id);
        newFields = newFields.map((f) => {
          if (f.type === "panel" && f.children) {
            return {
              ...f,
              children: f.children.filter((child) => child.id !== fieldData.id),
            };
          }
          return f;
        });

        // Add to target panel
        return newFields.map((f) => {
          if (f.id === panelId && f.type === "panel") {
            return {
              ...f,
              children: [...(f.children || []), fieldToAdd],
            };
          }
          return f;
        });
      });

      setSelectedFieldId(fieldData.id);
    },
    []
  );

  const removeFieldFromPanel = useCallback(
    (panelId: string, fieldId: string) => {
      setFields((prev) =>
        prev.map((f) => {
          if (f.id === panelId && f.type === "panel" && f.children) {
            return {
              ...f,
              children: f.children.filter((child) => child.id !== fieldId),
            };
          }
          return f;
        })
      );

      if (selectedFieldId === fieldId) {
        setSelectedFieldId(null);
      }
    },
    [selectedFieldId]
  );

  const moveField = useCallback((dragIndex: number, hoverIndex: number) => {
    setFields((prevFields) => {
      const newFields = [...prevFields];
      const [movedField] = newFields.splice(dragIndex, 1);
      newFields.splice(hoverIndex, 0, movedField);
      return newFields;
    });
  }, []);

  const updateField = useCallback((id: string, updates: Partial<FormField>) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return { ...f, ...updates };
        }
        if (f.type === "panel" && f.children) {
          return {
            ...f,
            children: f.children.map((child) =>
              child.id === id ? { ...child, ...updates } : child
            ),
          };
        }
        return f;
      })
    );
  }, []);

  const removeField = useCallback(
    (id: string) => {
      setFields((prev) => {
        const filtered = prev.filter((f) => f.id !== id);
        if (filtered.length !== prev.length) {
          return filtered;
        }
        return prev.map((f) => {
          if (f.type === "panel" && f.children) {
            return {
              ...f,
              children: f.children.filter((child) => child.id !== id),
            };
          }
          return f;
        });
      });

      if (selectedFieldId === id) {
        setSelectedFieldId(null);
      }
    },
    [selectedFieldId]
  );

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [ItemTypes.TOOL, ItemTypes.FIELD],
    drop: (item: any, monitor) => {
      // Don't handle if already handled by child
      if (monitor.didDrop()) return;

      if (item.type === ItemTypes.FIELD && item.fieldData) {
        // Field dropped back to main form from panel
        const fieldData = item.fieldData;

        setFields((prev) => {
          // Remove from any panel
          const newFields = prev.map((f) => {
            if (f.type === "panel" && f.children) {
              return {
                ...f,
                children: f.children.filter(
                  (child) => child.id !== fieldData.id
                ),
              };
            }
            return f;
          });

          // Add to main form if not already there
          if (!newFields.find((f) => f.id === fieldData.id)) {
            return [...newFields, fieldData];
          }
          return newFields;
        });
      } else if (
        item.type &&
        typeof item.type === "string" &&
        item.type !== ItemTypes.FIELD
      ) {
        addField(item.type as FieldType);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-white flex items-center gap-4 shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-3xl font-bold flex-1 border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 outline-none bg-transparent transition-colors"
            placeholder="Form Title"
          />
          <Button
            onClick={() => setShowPreview(true)}
            className="gap-2"
            size="lg"
          >
            <Eye size={18} />
            Preview
          </Button>
        </div>

        {/* Canvas */}
        <div
          ref={drop}
          className={`flex-1 p-8 overflow-y-auto ${
            isOver ? "bg-blue-50" : ""
          } transition-colors`}
        >
          <div className="max-w-5xl mx-auto space-y-4">
            {fields.map((field, index) =>
              field.type === "panel" ? (
                <PanelField
                  key={field.id}
                  field={field}
                  index={index}
                  moveField={moveField}
                  updateField={updateField}
                  removeField={removeField}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                  onSelectChild={(childId) => setSelectedFieldId(childId)}
                  addFieldToPanel={addFieldToPanel}
                  removeFieldFromPanel={removeFieldFromPanel}
                  selectedChildId={selectedFieldId}
                />
              ) : (
                <EditorField
                  key={field.id}
                  field={field}
                  index={index}
                  moveField={moveField}
                  updateField={updateField}
                  removeField={removeField}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                />
              )
            )}

            {fields.length === 0 && (
              <div className="text-center py-32 text-gray-400 border-2 border-dashed rounded-lg bg-white">
                <p className="font-semibold text-xl mb-2">
                  Drop a control here to start building
                </p>
                <p className="text-sm">
                  Drag field types from the left sidebar
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      <PropertiesPanel field={selectedField} onUpdate={updateField} />

      {/* Preview Modal */}
      {showPreview && (
        <FormPreview
          title={title}
          fields={fields}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
