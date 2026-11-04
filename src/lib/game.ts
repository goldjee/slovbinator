// public/dictionary.json, built by scripts/build-dictionary.ts
export type Dictionary = {
    sources: string[]; // long words to play with
    words: Record<string, string>; // word → its gloss
};

export type Game = {
    source: string;
    found: string[]; // newest first
};

export type Verdict = 'ok' | 'dup' | 'not' | 'self';

export function createGame(dict: Dictionary, previous?: string): Game {
    const pool = dict.sources.filter((s) => s !== previous);
    return {
        source: pool[Math.floor(Math.random() * pool.length)],
        found: [],
    };
}

// The word is always built from the source's tiles, so only the dictionary is left to check
export function check(game: Game, word: string, dict: Dictionary): Verdict {
    if (word === game.source) return 'self';
    if (game.found.includes(word)) return 'dup';
    return Object.hasOwn(dict.words, word) ? 'ok' : 'not';
}
