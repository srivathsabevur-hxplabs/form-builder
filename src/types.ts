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
  | "complex-table"
  | "dynamic-table"
  | "panel"; // NEW

export interface TableColumn {
  id: string;
  header: string;
  width?: string;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  value?: any;
  required?: boolean;
  placeholder?: string;

  // Style Props
  showLabel?: boolean;
  labelBold?: boolean;
  labelItalic?: boolean;
  labelUnderline?: boolean;
  labelSize?: number;
  underline?: boolean;
  borderBottom?: boolean;

  // Field styling
  fieldSize?: "small" | "medium" | "large";
  helperText?: string;

  // Options for Radio/Checkbox/Select
  options?: string[];
  listStyle?: "none" | "numbered" | "alpha";
  direction?: "row" | "column" | "grid";
  gridColumns?: number;

  // Description Content
  content?: string;

  // Table Data
  columns?: TableColumn[];
  tableData?: Array<Record<string, string>>;
  rows?: any[];

  // Panel Properties (NEW)
  panelWidth?: "full" | "half" | "third" | "two-thirds" | "quarter" | "custom";
  customWidth?: number; // Percentage for custom width
  columnsPerRow?: number; // How many fields can fit in one row
  children?: FormField[]; // Nested fields inside panel
  backgroundColor?: string;
  borderColor?: string;
  padding?: "none" | "small" | "medium" | "large";
}

export interface FormSchema {
  title: string;
  titleSize?: number;
  titleBorderBottom?: boolean;
  fields: FormField[];
}
