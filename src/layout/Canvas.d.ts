import React from 'react';

export interface CanvasItem {
  id: string;
  type: string;
  category: string;
  name: string;
}

export interface CanvasProps {
  items?: CanvasItem[];
  setItems?: React.Dispatch<React.SetStateAction<CanvasItem[]>> | ((items: any) => void);
  onSelectItem?: (id: string) => void;
  selectedId?: string;
}

export declare const Canvas: React.FC<CanvasProps>;
export declare const DesignCanvas: React.FC<CanvasProps>;
export default Canvas;
