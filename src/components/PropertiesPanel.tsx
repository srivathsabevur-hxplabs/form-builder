// src/components/PropertiesPanel.tsx
import React from "react";
import { type FormField } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface PropertiesPanelProps {
  selectedField: FormField | null;
  updateField: (id: string, updates: Partial<FormField>) => void;
}

export const PropertiesPanel = ({
  selectedField,
  updateField,
}: PropertiesPanelProps) => {
  if (!selectedField) {
    return (
      <div className="w-80 bg-gray-50 border-l p-6 flex items-center justify-center text-gray-400">
        <p className="text-center text-sm">
          Select a field to edit its properties
        </p>
      </div>
    );
  }

  const handleUpdate = (updates: Partial<FormField>) => {
    updateField(selectedField.id, updates);
  };

  // Option management functions
  const addOption = () => {
    const currentOptions = selectedField.options || [];
    handleUpdate({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(selectedField.options || [])];
    newOptions[index] = value;
    handleUpdate({ options: newOptions });
  };

  const removeOption = (index: number) => {
    const newOptions = (selectedField.options || []).filter(
      (_, i) => i !== index
    );
    handleUpdate({ options: newOptions });
  };

  return (
    <div className="w-80 bg-gray-50 border-l p-4 overflow-y-auto h-screen">
      <h2 className="text-lg font-bold mb-4">Field Properties</h2>

      {/* Field Type Badge */}
      <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded text-xs font-semibold uppercase text-center">
        {selectedField.type}
      </div>

      <div className="space-y-4">
        {/* Basic Properties */}
        <div>
          <Label className="text-xs font-semibold text-gray-600">
            Field Label
          </Label>
          <Input
            value={selectedField.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="mt-1"
          />
        </div>

        {selectedField.type === "text" && (
          <div>
            <Label className="text-xs font-semibold text-gray-600">
              Placeholder
            </Label>
            <Input
              value={selectedField.placeholder || ""}
              onChange={(e) => handleUpdate({ placeholder: e.target.value })}
              className="mt-1"
              placeholder="Enter placeholder text..."
            />
          </div>
        )}

        {selectedField.type === "description" && (
          <div>
            <Label className="text-xs font-semibold text-gray-600">
              Content
            </Label>
            <Textarea
              value={selectedField.content || ""}
              onChange={(e) => handleUpdate({ content: e.target.value })}
              className="mt-1"
              rows={4}
            />
          </div>
        )}

        <Separator />

        {/* Options Editor for Radio/Checkbox/Select */}
        {(selectedField.type === "radio" ||
          selectedField.type === "checkbox" ||
          selectedField.type === "select") && (
          <>
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-2 block">
                Options
              </Label>
              <div className="space-y-2">
                {(selectedField.options || []).map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      className="h-8 flex-1"
                      placeholder={`Option ${index + 1}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-red-500"
                      onClick={() => removeOption(index)}
                      disabled={(selectedField.options?.length || 0) <= 1}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full h-8 text-xs"
                  onClick={addOption}
                >
                  <Plus size={12} className="mr-1" /> Add Option
                </Button>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Label Styling */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 mb-2 block">
            Label Style
          </Label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Show Label</Label>
              <Switch
                checked={selectedField.showLabel !== false}
                onCheckedChange={(checked) =>
                  handleUpdate({ showLabel: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Bold</Label>
              <Switch
                checked={selectedField.labelBold || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ labelBold: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Italic</Label>
              <Switch
                checked={selectedField.labelItalic || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ labelItalic: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Underline</Label>
              <Switch
                checked={selectedField.labelUnderline || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ labelUnderline: checked })
                }
              />
            </div>

            <div>
              <Label className="text-xs block mb-1">Label Size</Label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={selectedField.labelSize || 14}
                  onChange={(e) =>
                    handleUpdate({ labelSize: parseInt(e.target.value) })
                  }
                  className="flex-1"
                />
                <span className="text-xs w-8 text-right">
                  {selectedField.labelSize || 14}px
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Field Styling */}
        <div>
          <Label className="text-xs font-semibold text-gray-600 mb-2 block">
            Field Style
          </Label>

          <div className="space-y-2">
            {selectedField.type === "text" && (
              <div className="flex items-center justify-between">
                <Label className="text-xs">Underline Input</Label>
                <Switch
                  checked={selectedField.underline || false}
                  onCheckedChange={(checked) =>
                    handleUpdate({ underline: checked })
                  }
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label className="text-xs">Bottom Border</Label>
              <Switch
                checked={selectedField.borderBottom || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ borderBottom: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-xs">Required</Label>
              <Switch
                checked={selectedField.required || false}
                onCheckedChange={(checked) =>
                  handleUpdate({ required: checked })
                }
              />
            </div>

            <div>
              <Label className="text-xs block mb-1">Field Size</Label>
              <Select
                value={selectedField.fieldSize || "medium"}
                onValueChange={(value) =>
                  handleUpdate({ fieldSize: value as any })
                }
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Helper Text */}
        <div>
          <Label className="text-xs font-semibold text-gray-600">
            Helper Text
          </Label>
          <Input
            value={selectedField.helperText || ""}
            onChange={(e) => handleUpdate({ helperText: e.target.value })}
            className="mt-1"
            placeholder="Optional help text..."
          />
        </div>

        {/* Layout options for Radio/Checkbox */}
        {(selectedField.type === "radio" ||
          selectedField.type === "checkbox") && (
          <>
            <Separator />
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-2 block">
                Layout
              </Label>

              <div className="space-y-2">
                <div>
                  <Label className="text-xs block mb-1">Direction</Label>
                  <Select
                    value={selectedField.direction || "column"}
                    onValueChange={(value) =>
                      handleUpdate({ direction: value as any })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="column">Column</SelectItem>
                      <SelectItem value="row">Row</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedField.direction === "grid" && (
                  <div>
                    <Label className="text-xs block mb-1">Grid Columns</Label>
                    <Input
                      type="number"
                      min={2}
                      max={6}
                      value={selectedField.gridColumns || 2}
                      onChange={(e) =>
                        handleUpdate({ gridColumns: parseInt(e.target.value) })
                      }
                      className="h-8"
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs block mb-1">List Style</Label>
                  <Select
                    value={selectedField.listStyle || "none"}
                    onValueChange={(value) =>
                      handleUpdate({ listStyle: value as any })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="numbered">1, 2, 3...</SelectItem>
                      <SelectItem value="alpha">A, B, C...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Panel-specific properties */}
        {selectedField.type === "panel" && (
          <>
            <Separator />
            <div>
              <Label className="text-xs font-semibold text-gray-600 mb-2 block">
                Panel Layout
              </Label>

              <div className="space-y-2">
                <div>
                  <Label className="text-xs block mb-1">Width</Label>
                  <Select
                    value={selectedField.panelWidth || "full"}
                    onValueChange={(value) =>
                      handleUpdate({ panelWidth: value as any })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width (100%)</SelectItem>
                      <SelectItem value="half">Half Width (50%)</SelectItem>
                      <SelectItem value="third">Third Width (33%)</SelectItem>
                      <SelectItem value="two-thirds">
                        Two Thirds (66%)
                      </SelectItem>
                      <SelectItem value="quarter">
                        Quarter Width (25%)
                      </SelectItem>
                      <SelectItem value="custom">Custom Width</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedField.panelWidth === "custom" && (
                  <div>
                    <Label className="text-xs block mb-1">
                      Custom Width (%)
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={selectedField.customWidth || 100}
                        onChange={(e) =>
                          handleUpdate({
                            customWidth: parseInt(e.target.value),
                          })
                        }
                        className="flex-1"
                      />
                      <span className="text-xs w-12 text-right">
                        {selectedField.customWidth || 100}%
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs block mb-1">Columns Per Row</Label>
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    value={selectedField.columnsPerRow || 1}
                    onChange={(e) =>
                      handleUpdate({ columnsPerRow: parseInt(e.target.value) })
                    }
                    className="h-8"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    How many fields can fit in one row
                  </p>
                </div>

                <div>
                  <Label className="text-xs block mb-1">Padding</Label>
                  <Select
                    value={selectedField.padding || "medium"}
                    onValueChange={(value) =>
                      handleUpdate({ padding: value as any })
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs block mb-1">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedField.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleUpdate({ backgroundColor: e.target.value })
                      }
                      className="h-8 w-16"
                    />
                    <Input
                      type="text"
                      value={selectedField.backgroundColor || "#ffffff"}
                      onChange={(e) =>
                        handleUpdate({ backgroundColor: e.target.value })
                      }
                      className="h-8 flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs block mb-1">Border Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedField.borderColor || "#e5e7eb"}
                      onChange={(e) =>
                        handleUpdate({ borderColor: e.target.value })
                      }
                      className="h-8 w-16"
                    />
                    <Input
                      type="text"
                      value={selectedField.borderColor || "#e5e7eb"}
                      onChange={(e) =>
                        handleUpdate({ borderColor: e.target.value })
                      }
                      className="h-8 flex-1"
                      placeholder="#e5e7eb"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
