import { IMessageCard } from '@shared/components/message-card/interfaces/message-card.interface';

export interface ISupportCenter {
  id?: string;
  supportApplicationStatusId: string;
  supportApplicationStatusName: string;
  supportApplicationCategoryId: string;
  supportApplicationCategoryName: string;
  name: string;
  contactPhoneNumber: number;
  contactEmail: string;
  lastMessageAt: string;
  rating?: number;
  ratingComment?: string;
  supportApplicationMessages?: IMessageCard[];
  isCompleted?: boolean;
  number: number;
}

export interface ISupportCenterRequest {
  id?: string;
  name: string;
  supportApplicationCategoryId: string;
  message?: string;
  contactPhoneNumber?: string;
  contactEmail?: string;
  fileIds?: string[];
}
