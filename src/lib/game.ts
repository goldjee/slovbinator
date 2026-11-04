// public/dictionary.json, built by scripts/build-dictionary.ts
export type Dictionary = {
    sources: string[]; // long words to play with
    common: string[]; // well known words: the player wins by finding all of them
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

export type Score = {
    common: number;
    commonTotal: number;
    rare: number;
    rareTotal: number;
};

// answers: every dictionary word the source makes
export function score(
    found: string[],
    answers: string[],
    common: Set<string>,
): Score {
    const commonTotal = answers.filter((w) => common.has(w)).length;
    const commonFound = found.filter((w) => common.has(w)).length;
    return {
        common: commonFound,
        commonTotal,
        rare: found.length - commonFound,
        rareTotal: answers.length - commonTotal,
    };
}
