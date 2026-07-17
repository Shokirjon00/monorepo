export interface IAdminRole{
  id?: string;
  name: string;
  description: string;
  createdAt?: string;
  modifiedAt?: string;
  isActive: boolean;
  statusName: string;
  permissions?: string[];
}

export interface IPermissions {
  id: string,
  name: string,
  parentId: string,
  isHidden: boolean,
  expanded: boolean,
  checked: boolean,
  permissions: IPermissions[],
  childs: IPermissions[]
}
