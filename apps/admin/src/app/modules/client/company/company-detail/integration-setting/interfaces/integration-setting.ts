export interface IIntegrationSetting {
  id: string;
  merchantId: string;
  merchantName: string;
  integrationCount: number;
  integrations: IIntegration[];
  isActive: boolean;
}

export interface IIntegration {
  id: string;
  integrationTypeId: string;
  integrationTypeName: string;
  integrationJson: string;
  posCount: number;
}
