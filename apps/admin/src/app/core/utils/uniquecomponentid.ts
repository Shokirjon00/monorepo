
export let lastId = 0;

export function UniqueComponentId (): any {
    const prefix = 'pr_id_';
    lastId++;
    return `${prefix}${lastId}`;
}
