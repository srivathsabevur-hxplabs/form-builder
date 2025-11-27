// src/Controls.tsx
import React from "react";
import { useDrag } from "react-dnd";
import { ItemTypes, type FieldType } from "@/types";
import {
  Type,
  CheckSquare,
  List,
  Calendar,
  PenTool,
  Table,
  Grid,
  LayoutGrid, // NEW icon for panel
} from "lucide-react";

interface ToolProps {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
}

const Tool = ({ type, label, icon }: ToolProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.TOOL,
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className="p-3 mb-2 border rounded-lg bg-white shadow-sm flex items-center cursor-grab"
    >
      {icon}
      <span className="ml-2 text-sm font-medium">{label}</span>
    </div>
  );
};

export const Controls = () => {
  const tools: ToolProps[] = [
    { type: "panel", label: "Panel", icon: <LayoutGrid size={16} /> }, // NEW - Added at top
    { type: "text", label: "Text Input", icon: <Type size={16} /> },
    { type: "checkbox", label: "Checkbox", icon: <CheckSquare size={16} /> },
    { type: "radio", label: "Radio Group", icon: <List size={16} /> },
    { type: "select", label: "Dropdown", icon: <List size={16} /> },
    { type: "date", label: "Date Picker", icon: <Calendar size={16} /> },
    { type: "signature", label: "Signature", icon: <PenTool size={16} /> },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r p-4 overflow-y-auto h-screen">
      <h2 className="text-lg font-bold mb-4">Controls</h2>
      {tools.map((tool) => (
        <Tool key={tool.type} {...tool} />
      ))}
    </div>
  );
};
