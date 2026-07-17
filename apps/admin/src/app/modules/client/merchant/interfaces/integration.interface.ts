export interface IIntegration {
  id: string;
  integrationJson: string;
  integrationTypeName: string;
  isActive: boolean;
  isEskhataAcquirer: boolean;
  statusName: string;
  paramJson: string | any;
}
