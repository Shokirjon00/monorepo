import { Observable } from "rxjs";

export interface ChangeOrderStatusRequest {
  supportApplicationId: string;
  supportApplicationStatusId: string;
}

export interface ChangeUserRequest {
  supportApplicationId: string;
  adminUserId: string;
}

export interface SendMessageRequest {
  supportApplicationId: string;
  message?: string;
  fileIds?: string[];
}

export interface StatusOption {
  id: string;
  name: string;
}

export interface ChangeStatusDialogData {
  title: string;
  rowId: string;
  statusOptions?: StatusOption[] | null;
  userOptions?: StatusOption[] | null;
  loadUsers?: (page: number) => Observable<LoadUsersResponse>;
}

export interface LoadUsersResponse {
  users: StatusOption[];
  hasNextPage: boolean;
  nextPage: number;
}
