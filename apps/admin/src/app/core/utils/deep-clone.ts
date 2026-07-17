export function DeepClone(value: any): any{
    return JSON.parse(JSON.stringify(value));
}
