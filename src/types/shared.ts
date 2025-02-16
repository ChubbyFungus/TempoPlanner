import { ReactNode } from 'react';

export interface ToolbarItem {
  id: string;
  name: string;
  type: string;
  icon?: ReactNode;
  category: string;
  width?: number;
  height?: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  brand: string;
  model: string;
  image: string;
  category: string;
  width: number;
  height: number;
  depth: number;
  description: string;
  price?: string;
} 