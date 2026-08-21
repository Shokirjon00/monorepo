export let lastId = 0;

export function UniqueComponentId(): string {
  const prefix = 'pr_id_';
  lastId++;
  return `${prefix}${lastId}`;
}
