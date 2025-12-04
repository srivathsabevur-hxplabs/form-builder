// src/types.ts

export const ItemTypes = {
  TOOL: "tool",
  FIELD: "field",
  PANEL: "panel",
};

export type FieldType =
  | "text"
  | "description"
  | "radio"
  | "checkbox"
  | "select"
  | "date"
  | "signature"
  | "panel";

export type DateFormat =
  | "MM/DD/YYYY"
  | "DD/MM/YYYY"
  | "YYYY-MM-DD"
  | "DD-MM-YYYY"
  | "MM-DD-YYYY";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  value?: any;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
  helperText?: string;
  showLabel?: boolean;
  labelBold?: boolean;
  labelItalic?: boolean;
  labelUnderline?: boolean;
  labelSize?: number;
  underline?: boolean;
  borderBottom?: boolean;
  size?: "small" | "medium" | "large";
  layoutDirection?: "row" | "column" | "grid";
  gridColumns?: number;
  width?: "full" | "half" | "third" | "quarter" | "custom";
  customWidth?: string;
  dateFormat?: DateFormat;
  content?: string;

  // Panel-specific properties
  children?: FormField[];
  columnsPerRow?: number;
  rowsLayout?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  padding?: number;
  showPanelLabel?: boolean; // NEW: Hide/show panel label
}
