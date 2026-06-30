import { ComparableVariant } from '@modules/food/menu/interfaces/menu-detail.interface';

export function normalizeVariant(v: any): ComparableVariant {
  return {
    id: v.productVariantId,
    price: Number(v.price?.amount ?? 0),
    isActive: !!v.isActive,
    name: v.name ?? '',
    dimension: Number(v.dimensionValue ?? 0),
    image: v.image ?? null,
  };
}
