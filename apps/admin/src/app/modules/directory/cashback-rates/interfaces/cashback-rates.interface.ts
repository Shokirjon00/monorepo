import {ICashbackGradations} from '@modules/directory/cashback-rates/interfaces/cashback-gradations.interface';

export interface ICashbackRates {
  id: string;
  name: string;
  createdAt?: string;
  modifiedAt?: string;
  userName?: string;
  isActive: boolean;
  statusName?: string;
  cashbackGradations?: ICashbackGradations[];
}
