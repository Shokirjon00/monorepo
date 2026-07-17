export interface IMenu {
  id: string;
  name: string;
  productName: string;
  categoryName: string;
  createdDateTime: string;
  isActive: boolean;
  productApplicationType: ProductApplicationType;
}

interface ProductApplicationType{
  name: string;
  value: string;
}