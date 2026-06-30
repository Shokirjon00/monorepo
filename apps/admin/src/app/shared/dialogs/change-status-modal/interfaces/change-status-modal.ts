import { Observable } from "rxjs";

export interface ChangeStatusModalData {
  title: string;
  rowId: string;
  statusOptions: { id: string; name: string }[];
  userOptions: { id: string; name: string }[];
  initialValues: {
    statusId: string;
    userId: string;
  };
  loadUsers?: (page: number, search?: string) => Observable<LoadUsersResponse>;
}

export interface LoadUsersResponse {
  users: { id: string; name: string }[];
  hasNextPage: boolean;
  nextPage: number;
}

