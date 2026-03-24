export const getValueOrFallback = <T,>(item: T, key: keyof T, fallback: string = "N/A"): string => {
    return (item[key] as string) || fallback;
};
