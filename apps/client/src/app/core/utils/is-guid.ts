export function isGuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function isListOfGuids(value: any): boolean {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.every(item => typeof item === 'string' && isGuid(item));
}