// src/components/PropertiesPanel.tsx

import React from "react";
import { type FormField, type DateFormat } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react";

interface PropertiesPanelProps {
  field: FormField | null;
  onUpdate: (id: string, updates: Partial<FormField>) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  field,
  onUpdate,
}) => {
  if (!field) {
    return (
      <div className="w-80 bg-white border-l p-6 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-sm font-medium">No field selected</p>
          <p className="text-xs mt-1">Select a field to edit properties</p>
        </div>
      </div>
    );
  }

  const addOption = () => {
    const newOption = {
      label: `Option ${(field.options?.length || 0) + 1}`,
      value: `option_${(field.options?.length || 0) + 1}`,
    };
    onUpdate(field.id, {
      options: [...(field.options || []), newOption],
    });
  };

  const updateOption = (
    index: number,
    key: "label" | "value",
    value: string
  ) => {
    const updatedOptions = [...(field.options || [])];
    updatedOptions[index] = { ...updatedOptions[index], [key]: value };
    onUpdate(field.id, { options: updatedOptions });
  };

  const removeOption = (index: number) => {
    if ((field.options?.length || 0) <= 1) return;
    const updatedOptions = field.options?.filter((_, i) => i !== index);
    onUpdate(field.id, { options: updatedOptions });
  };

  return (
    <div className="w-80 bg-white border-l overflow-y-auto h-screen">
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <h2 className="text-lg font-bold text-gray-800">Properties</h2>
        <p className="text-xs text-gray-500 mt-1">
          Customize the selected field
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* Field Type Badge */}
        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-xs font-bold uppercase text-center">
          {field.type}
        </div>

        {/* Common Properties */}
        {field.type !== "panel" && (
          <>
            {/* Label Text */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Label
              </Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                className="mt-1"
              />
            </div>

            {/* Show Label Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Show Label
              </Label>
              <Switch
                checked={field.showLabel !== false}
                onCheckedChange={(checked) =>
                  onUpdate(field.id, { showLabel: checked })
                }
              />
            </div>

            {/* Label Styling */}
            {field.showLabel !== false && (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Label Style
                </p>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Bold</Label>
                  <Switch
                    checked={field.labelBold || false}
                    onCheckedChange={(checked) =>
                      onUpdate(field.id, { labelBold: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Italic</Label>
                  <Switch
                    checked={field.labelItalic || false}
                    onCheckedChange={(checked) =>
                      onUpdate(field.id, { labelItalic: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-sm">Underline</Label>
                  <Switch
                    checked={field.labelUnderline || false}
                    onCheckedChange={(checked) =>
                      onUpdate(field.id, { labelUnderline: checked })
                    }
                  />
                </div>

                <div>
                  <Label className="text-sm">
                    Font Size: {field.labelSize || 14}px
                  </Label>
                  <Slider
                    value={[field.labelSize || 14]}
                    onValueChange={(value) =>
                      onUpdate(field.id, { labelSize: value[0] })
                    }
                    min={10}
                    max={24}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Width Control for all fields */}
        <div>
          <Label className="text-sm font-semibold text-gray-700">Width</Label>
          <Select
            value={field.width || "full"}
            onValueChange={(value) =>
              onUpdate(field.id, { width: value as any })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full (100%)</SelectItem>
              <SelectItem value="half">Half (50%)</SelectItem>
              <SelectItem value="third">Third (33%)</SelectItem>
              <SelectItem value="quarter">Quarter (25%)</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          {field.width === "custom" && (
            <Input
              value={field.customWidth || ""}
              onChange={(e) =>
                onUpdate(field.id, { customWidth: e.target.value })
              }
              placeholder="e.g., 250px or 60%"
              className="mt-2"
            />
          )}
        </div>

        {/* Placeholder for text fields */}
        {field.type === "text" && (
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Placeholder
            </Label>
            <Input
              value={field.placeholder || ""}
              onChange={(e) =>
                onUpdate(field.id, { placeholder: e.target.value })
              }
              placeholder="Enter placeholder text..."
              className="mt-1"
            />
          </div>
        )}

        {/* Content for description */}
        {field.type === "description" && (
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Content
            </Label>
            <Textarea
              value={field.content || ""}
              onChange={(e) => onUpdate(field.id, { content: e.target.value })}
              placeholder="Enter description text..."
              className="mt-1"
              rows={4}
            />
          </div>
        )}

        {/* Date Format Selection */}
        {field.type === "date" && (
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Date Format
            </Label>
            <Select
              value={field.dateFormat || "MM/DD/YYYY"}
              onValueChange={(value) =>
                onUpdate(field.id, { dateFormat: value as DateFormat })
              }
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Panel Properties */}
        {field.type === "panel" && (
          <>
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Panel Title
              </Label>
              <Input
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                placeholder="Panel title..."
                className="mt-1"
              />
            </div>

            {/* Show Panel Label Toggle */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Show Panel Label
              </Label>
              <Switch
                checked={field.showPanelLabel !== false}
                onCheckedChange={(checked) =>
                  onUpdate(field.id, { showPanelLabel: checked })
                }
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Columns Per Row: {field.columnsPerRow || 1}
              </Label>
              <Slider
                value={[field.columnsPerRow || 1]}
                onValueChange={(value) =>
                  onUpdate(field.id, { columnsPerRow: value[0] })
                }
                min={1}
                max={6}
                step={1}
                className="mt-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-gray-700">
                Row-wise Layout
              </Label>
              <Switch
                checked={field.rowsLayout || false}
                onCheckedChange={(checked) =>
                  onUpdate(field.id, { rowsLayout: checked })
                }
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Background Color
              </Label>
              <Input
                type="color"
                value={field.backgroundColor || "#ffffff"}
                onChange={(e) =>
                  onUpdate(field.id, { backgroundColor: e.target.value })
                }
                className="mt-1 h-10"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Border Color
              </Label>
              <Input
                type="color"
                value={field.borderColor || "#e5e7eb"}
                onChange={(e) =>
                  onUpdate(field.id, { borderColor: e.target.value })
                }
                className="mt-1 h-10"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-gray-700">
                Padding: {field.padding || 16}px
              </Label>
              <Slider
                value={[field.padding || 16]}
                onValueChange={(value) =>
                  onUpdate(field.id, { padding: value[0] })
                }
                min={0}
                max={48}
                step={4}
                className="mt-2"
              />
            </div>
          </>
        )}

        {/* Options for Radio/Checkbox/Select with Value Mapping */}
        {(field.type === "radio" ||
          field.type === "checkbox" ||
          field.type === "select") && (
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Options
            </Label>
            <div className="space-y-2">
              {field.options?.map((option, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex gap-2">
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        updateOption(index, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="flex-1"
                    />
                    {(field.options?.length || 0) > 1 && (
                      <Button
                        onClick={() => removeOption(index)}
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={option.value}
                    onChange={(e) =>
                      updateOption(index, "value", e.target.value)
                    }
                    placeholder="Value"
                    className="text-sm"
                  />
                </div>
              ))}
              <Button
                onClick={addOption}
                variant="outline"
                size="sm"
                className="w-full mt-2"
              >
                <Plus size={14} className="mr-1" />
                Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Layout Options for Radio/Checkbox */}
        {(field.type === "radio" || field.type === "checkbox") && (
          <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-600 uppercase">
              Layout Options
            </p>

            <div>
              <Label className="text-sm">Layout Direction</Label>
              <Select
                value={field.layoutDirection || "column"}
                onValueChange={(value) =>
                  onUpdate(field.id, { layoutDirection: value as any })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="row">Row</SelectItem>
                  <SelectItem value="column">Column</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {field.layoutDirection === "grid" && (
              <div>
                <Label className="text-sm">
                  Grid Columns: {field.gridColumns || 2}
                </Label>
                <Slider
                  value={[field.gridColumns || 2]}
                  onValueChange={(value) =>
                    onUpdate(field.id, { gridColumns: value[0] })
                  }
                  min={2}
                  max={4}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}
          </div>
        )}

        {/* Required Toggle */}
        {field.type !== "panel" && field.type !== "description" && (
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700">
              Required
            </Label>
            <Switch
              checked={field.required || false}
              onCheckedChange={(checked) =>
                onUpdate(field.id, { required: checked })
              }
            />
          </div>
        )}

        {/* Helper Text */}
        {field.type !== "panel" && (
          <div>
            <Label className="text-sm font-semibold text-gray-700">
              Helper Text
            </Label>
            <Textarea
              value={field.helperText || ""}
              onChange={(e) =>
                onUpdate(field.id, { helperText: e.target.value })
              }
              placeholder="Add helper text..."
              className="mt-1"
              rows={2}
            />
          </div>
        )}
      </div>
    </div>
  );
};
