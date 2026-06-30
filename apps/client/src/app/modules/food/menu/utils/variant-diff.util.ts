import { ComparableVariant } from '@modules/food/menu/interfaces/menu-detail.interface';

const STATUS_PRICE_KEYS: (keyof ComparableVariant)[] = [
  'price',
  'isActive'
];

const STRUCTURAL_KEYS: (keyof ComparableVariant)[] = [
  'name',
  'dimension',
  'image'
];

export function diffVariant(
  initial: ComparableVariant,
  current: ComparableVariant
) {
  const changedKeys = Object.keys(initial).filter(
    key => initial[key as keyof ComparableVariant] !== current[key as keyof ComparableVariant]
  ) as (keyof ComparableVariant)[];

  return {
    changed: changedKeys.length > 0,
    onlyStatusOrPrice:
      changedKeys.length > 0 &&
      changedKeys.every(k => STATUS_PRICE_KEYS.includes(k)),
    structuralChanged:
      changedKeys.some(k => STRUCTURAL_KEYS.includes(k))
  };
}
