export type Attribute = "fire" | "water" | "wind" | "light" | "dark";

export interface Monster {
  id: string;
  nameKr: string;
  awakenedNameKr: string;
  attribute: Attribute;
  baseSpeed: number;
  stars: 2 | 3 | 4 | 5;
}
