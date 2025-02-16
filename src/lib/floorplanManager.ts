import { CanvasElement } from '@/types/shared';
import { calculatePolygonArea, convertToSquareFeet } from '@/lib/geometry';

interface FloorplanData {
  version: string;
  elements: CanvasElement[];
  name: string;
  lastModified: string;
  metadata?: {
    totalArea?: number;
    roomCount?: number;
    applianceCount?: number;
  };
}

export const saveFloorplan = async (elements: CanvasElement[], name: string): Promise<void> => {
  try {
    const floorplan: FloorplanData = {
      version: '1.0',
      elements,
      name,
      lastModified: new Date().toISOString(),
      metadata: {
        totalArea: calculateTotalArea(elements),
        roomCount: countElementsByType(elements, 'room'),
        applianceCount: countApplianceElements(elements),
      },
    };

    // Save to localStorage for now, can be extended to backend later
    localStorage.setItem(`floorplan-${name}`, JSON.stringify(floorplan));
  } catch (error) {
    console.error('Error saving floorplan:', error);
    throw new Error('Failed to save floorplan');
  }
};

export const loadFloorplan = async (name: string): Promise<CanvasElement[]> => {
  try {
    const data = localStorage.getItem(`floorplan-${name}`);
    if (!data) throw new Error('Floorplan not found');

    const floorplan: FloorplanData = JSON.parse(data);
    return floorplan.elements;
  } catch (error) {
    console.error('Error loading floorplan:', error);
    throw new Error('Failed to load floorplan');
  }
};

export const listFloorplans = (): string[] => {
  const floorplans: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('floorplan-')) {
      floorplans.push(key.replace('floorplan-', ''));
    }
  }
  return floorplans;
};

// Helper functions
const calculateTotalArea = (elements: CanvasElement[]): number => {
  return elements
    .filter(el => el.type === 'room')
    .reduce((total, room) => {
      if (room.points) {
        const areaInPixels = calculatePolygonArea(room.points);
        return total + convertToSquareFeet(areaInPixels);
      }
      return total;
    }, 0);
};

const countElementsByType = (elements: CanvasElement[], type: string): number => {
  return elements.filter(el => el.type === type).length;
};

const countApplianceElements = (elements: CanvasElement[]): number => {
  return elements.filter(el => el.type.includes('refrigerator')).length;
};

// Export types for use in other files
export type { FloorplanData }; 