export interface IHistory {
  id: string,
  fullname: string,
  type: string,
  tableName: string,
  oldValues: string,
  newValues: string,
  affectedColumns: string,
  primaryKey: string,
  createdAt: string
}
