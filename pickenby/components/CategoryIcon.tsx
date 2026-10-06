import {
  AudioLines,
  Blend,
  CookingPot,
  Droplets,
  Flame,
  House,
  LayoutGrid,
  Microwave,
  Refrigerator,
  Snowflake,
  Tv,
  WashingMachine,
} from "lucide-react";

const categoryIcons = {
  tv: Tv,
  snowflake: Snowflake,
  fridge: Refrigerator,
  washer: WashingMachine,
  pot: CookingPot,
  flame: Flame,
  oven: Microwave,
  blender: Blend,
  speaker: AudioLines,
  drops: Droplets,
  house: House,
} as const;

type CategoryIconName = keyof typeof categoryIcons;

export function CategoryIcon({ name, className = "size-4" }: { name?: string; className?: string }) {
  const Icon = categoryIcons[name as CategoryIconName] ?? LayoutGrid;

  return <Icon aria-hidden="true" className={className} />;
}
