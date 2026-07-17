export interface IMenuDetail {
  id: string;
  name: string;
  productName: string;
  categoryId: string;
  dimensionUnitName: string;
  dimensionUnit: string;
  description: string;
  productDescription: string;
  isActive: boolean;
  productApplicationType: string;
  productVariants: ProductVariants[];
  comment?: string;
}

interface ProductVariants{
  productVariantId: string;
  name: string;
  image: string;
  dimensionValue: string;
  price: MenuPrice
}

interface MenuPrice{
  amount: number;
  currencyCode: string;
}

export interface ProductVariant {
  productVariantId: string;
  name: string;
  dimensionValue: number;
  image: string | null;
  isActive: boolean;
  price: {
    amount: number;
    currencyCode: string;
  };
}

export type ComparableVariant = {
  id: string;
  price: number;
  isActive: boolean;
  name: string;
  dimension: number;
  image: string | null;
};
