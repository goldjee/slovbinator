// Е and Ё are one letter in the game
export const normalize = (word: string) =>
    word.toLowerCase().replaceAll('ё', 'е');

// Counts of а..я, indexed by char code
export function letterCounts(word: string) {
    const counts = new Uint8Array(32);
    for (let i = 0; i < word.length; i++) counts[word.charCodeAt(i) - 0x430]++;
    return counts;
}

// Each letter of the source can be used only once
export function canMake(word: Uint8Array, source: Uint8Array) {
    for (let i = 0; i < 32; i++) if (word[i] > source[i]) return false;
    return true;
}

// All dictionary words made of the source's letters, except the source itself
export function subwords(source: string, words: string[]) {
    const counts = letterCounts(source);
    return words.filter(
        (w) =>
            w !== source &&
            w.length <= source.length &&
            canMake(letterCounts(w), counts),
    );
}
