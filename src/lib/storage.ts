export const KEY = {
    game: 'slovbinator:game',
    theme: 'slovbinator:theme',
};

export function load<V>(key: string): V | null {
    try {
        const s = localStorage.getItem(key);
        return s ? (JSON.parse(s) as V) : null;
    } catch {
        return null;
    }
}

export function save(key: string, value: unknown) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage full or blocked: the game still works, it just won't persist.
    }
}
