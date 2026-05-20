const autoIncrements = new Map<string, number>();

export function autoIncrement(table: string): number {
    const id = (autoIncrements.get(table) ?? 0) + 1;

    autoIncrements.set(table, id);

    return id;
}
