export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunkCount = Math.ceil(array.length / chunkSize);

    return [...new Array(chunkCount)].map((_, i) =>
        array.slice(i * chunkSize, (i + 1) * chunkSize),
    );
}
