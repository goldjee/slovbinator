// public/dictionary.json, built by scripts/build-dictionary.ts
export type Dictionary = {
    sources: string[]; // long words to play with
    common: string[]; // well known words: the player wins by finding all of them
    words: Record<string, string>; // word → its gloss
};

export type Game = {
    source: string;
    found: string[]; // newest first
    elapsed: number; // ms of visible play
    hints: number;
    hintAt: number; // elapsed ms when the next hint unlocks
};

// Same as in Sudokushka: the first hint is free, each next one waits 1.5 times longer
const HINT_COOLDOWN = 60_000;
const HINT_GROWTH = 1.5;

export type Verdict = 'ok' | 'dup' | 'not' | 'self';

export function createGame(dict: Dictionary, previous?: string): Game {
    const pool = dict.sources.filter((s) => s !== previous);
    return {
        source: pool[Math.floor(Math.random() * pool.length)],
        found: [],
        elapsed: 0,
        hints: 0,
        hintAt: 0,
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

// Games saved before hints existed
export const upgrade = (
    g: Pick<Game, 'source' | 'found'> & Partial<Game>,
): Game => ({
    elapsed: 0,
    hints: 0,
    hintAt: 0,
    ...g,
});

export const hintWait = (g: Game) => Math.max(0, g.hintAt - g.elapsed);

// The longest common word not found yet: the player needs all of them to win
export function revealHint(
    g: Game,
    answers: string[],
    common: Set<string>,
): { game: Game; word: string } | null {
    if (hintWait(g) > 0) return null;
    const left = answers.filter((w) => common.has(w) && !g.found.includes(w));
    if (!left.length) return null;
    const word = left.reduce((a, b) => (b.length > a.length ? b : a));
    const hints = g.hints + 1;
    return {
        word,
        game: {
            ...g,
            hints,
            hintAt: g.elapsed + HINT_COOLDOWN * HINT_GROWTH ** (hints - 1),
        },
    };
}
