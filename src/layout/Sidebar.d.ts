import React from 'react';

export interface SidebarProps {
  onAddComponent?: (comp: any) => void;
  onAddSuite?: () => void;
  activeCategoryFilter?: string;
}

export declare const Sidebar: React.FC<SidebarProps>;
export declare const ComponentSidebar: React.FC<SidebarProps>;
export default Sidebar;
