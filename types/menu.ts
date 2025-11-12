export type MenuItem = NavItem | MenuDivider;

export interface MenuDivider {
  type: 'divider';
  label: string;
  roles?: string[];
}

export interface NavItem {
  type?: 'item';
  label: string; 
  view: string;
  icon: string;
  roles?: string[];
  children?: NavItem[];
}