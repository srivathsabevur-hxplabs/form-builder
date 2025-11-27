// src/Index.tsx
import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Editor } from "./Editor";
import { Controls } from "@/components/Controls";
import { PropertiesPanel } from "@/components/PropertiesPanel";

const Index = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Left Sidebar - Controls */}
        <div className="w-64 bg-gray-50 border-r">
          <Controls />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1">
          <Editor />
        </div>

        {/* Right Sidebar - Properties Panel (will be connected from Editor) */}
      </div>
    </DndProvider>
  );
};

export default Index;
