export class ObjectUtils {
  public static isEmpty(value: string | any[]): any {
    return (
      value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (!(value instanceof Date) && typeof value === 'object' && Object.keys(value).length === 0)
    );
  }
}
