// src/Editor.tsx
import React, { useState, useCallback } from "react";
import { useDrop } from "react-dnd";
import { type FormField, ItemTypes, type FieldType } from "@/types";
import { EditorField } from "@/components/EditorField";
import { PanelField } from "@/components/PanelField";
import { PropertiesPanel } from "@/components/PropertiesPanel";

export const Editor = () => {
  const [fields, setFields] = useState<FormField[]>([]);
  const [title, setTitle] = useState("My Drag & Drop Form");
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  // Find selected field (could be top-level or nested in panel)
  const getSelectedField = (): FormField | null => {
    // Check top level
    const topLevel = fields.find((f) => f.id === selectedFieldId);
    if (topLevel) return topLevel;

    // Check inside panels
    for (const field of fields) {
      if (field.type === "panel" && field.children) {
        const nested = field.children.find((c) => c.id === selectedFieldId);
        if (nested) return nested;
      }
    }
    return null;
  };

  const selectedField = getSelectedField();

  const addField = useCallback((type: FieldType) => {
    const baseField = {
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
      fieldSize: "medium" as const,
    };

    let newField: FormField;

    if (type === "panel") {
      newField = {
        ...baseField,
        label: "Panel Container",
        panelWidth: "full",
        columnsPerRow: 1,
        children: [],
        backgroundColor: "#ffffff",
        borderColor: "#e5e7eb",
        padding: "medium",
      };
    } else if (["radio", "checkbox", "select"].includes(type)) {
      newField = {
        ...baseField,
        options: ["Option 1", "Option 2", "Option 3"],
        direction: ["radio", "checkbox"].includes(type) ? "column" : undefined,
        gridColumns: ["radio", "checkbox"].includes(type) ? 2 : undefined,
        listStyle: ["radio", "checkbox"].includes(type) ? "none" : undefined,
      };
    } else if (type === "description") {
      newField = {
        ...baseField,
        content: "Enter your description here...",
      };
    } else if (type === "dynamic-table") {
      newField = {
        ...baseField,
        columns: [
          { id: "c1", header: "Column 1", width: "50%" },
          { id: "c2", header: "Column 2", width: "50%" },
        ],
        tableData: [
          { c1: "", c2: "" },
          { c1: "", c2: "" },
        ],
      };
    } else {
      newField = baseField;
    }

    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newField.id);
  }, []);

  const addFieldToPanel = useCallback((panelId: string, type: FieldType) => {
    const baseField = {
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
      fieldSize: "medium" as const,
    };

    let newField: FormField;

    if (["radio", "checkbox", "select"].includes(type)) {
      newField = {
        ...baseField,
        options: ["Option 1", "Option 2", "Option 3"],
        direction: ["radio", "checkbox"].includes(type) ? "column" : undefined,
        gridColumns: ["radio", "checkbox"].includes(type) ? 2 : undefined,
        listStyle: ["radio", "checkbox"].includes(type) ? "none" : undefined,
      };
    } else if (type === "description") {
      newField = {
        ...baseField,
        content: "Enter your description here...",
      };
    } else if (type === "dynamic-table") {
      newField = {
        ...baseField,
        columns: [
          { id: "c1", header: "Column 1", width: "50%" },
          { id: "c2", header: "Column 2", width: "50%" },
        ],
        tableData: [
          { c1: "", c2: "" },
          { c1: "", c2: "" },
        ],
      };
    } else {
      newField = baseField;
    }

    setFields((prev) =>
      prev.map((f) => {
        if (f.id === panelId && f.type === "panel") {
          return {
            ...f,
            children: [...(f.children || []), newField],
          };
        }
        return f;
      })
    );

    setSelectedFieldId(newField.id);
  }, []);

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
        // Also check if field is inside a panel
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
        // First, try to remove from top level
        const filtered = prev.filter((f) => f.id !== id);

        // If length changed, field was at top level
        if (filtered.length !== prev.length) {
          return filtered;
        }

        // Otherwise, check inside panels
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
    accept: ItemTypes.TOOL,
    drop: (item: { type: FieldType }, monitor) => {
      // Only add if not dropped on a nested target
      if (!monitor.didDrop()) {
        addField(item.type);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

  return (
    <div className="flex flex-1">
      <div
        ref={drop}
        className={`flex-1 p-6 md:p-10 bg-white min-h-screen transition-colors ${
          isOver ? "bg-blue-50" : ""
        }`}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-4xl font-bold w-full mb-8 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 outline-none bg-transparent transition-colors"
          placeholder="Form Title"
        />

        <div className="space-y-4">
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
        </div>

        {fields.length === 0 && (
          <div className="text-center py-24 text-gray-400 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
            <p className="font-semibold text-lg mb-2">
              Drop a control here to start building
            </p>
            <p className="text-sm">Drag field types from the left sidebar</p>
          </div>
        )}
      </div>

      {/* Properties Panel */}
      <PropertiesPanel
        selectedField={selectedField}
        updateField={updateField}
      />
    </div>
  );
};
