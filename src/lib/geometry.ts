export function calculatePolygonArea(
  points: { x: number; y: number }[],
): number {
  if (points.length < 3) return 0;

  // Using the Shoelace formula (also known as surveyor's formula)
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

export function convertToSquareFeet(
  areaInPixels: number,
  gridSize: number = 20,
): number {
  // Assuming each grid unit (20px) represents 1 foot
  const squareFeet = areaInPixels / (gridSize * gridSize);
  return Math.round(squareFeet * 100) / 100;
}
