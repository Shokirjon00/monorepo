export let lastId = 0;

export function UniqueComponentId (): string {
    let prefix = 'pr_id_';
    lastId++;
    return `${prefix}${lastId}`;
}
