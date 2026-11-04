// Builds public/dictionary.json from the Russian Wiktionary (CC BY-SA), extracted by Wiktextract: https://kaikki.org/ruwiktionary/
// Run: bun run dictionary
import { mkdir } from 'node:fs/promises';
import { canMake, letterCounts, normalize } from '../src/lib/words';

const WIKTIONARY_URL =
    'https://kaikki.org/ruwiktionary/raw-wiktextract-data.jsonl.gz';
const CACHE_DIR = `${import.meta.dir}/../.cache`;
// Lemma frequencies by part of speech: Ляшевская О. Н., Шаров С. А. Частотный словарь современного русского языка (на материалах НКРЯ). М., 2009. http://dict.ruslang.ru/freq.php
const FREQ_URL = 'http://dict.ruslang.ru/Freq2011.zip';
const OUT = `${import.meta.dir}/../public/dictionary.json`;

const MAX_LEN = 13;
const MIN_SOURCE_LEN = 7;
const MAX_SENSES = 2;
const COMMON_IPM = 2; // a noun used this many times per million words is common; the player must find all common words
const SOURCE_IPM = 10; // source words are well known nouns
const MIN_COMMON = 10; // fewer common words to find is no fun

const WORD = /^[а-яё]+$/; // lowercase only: proper names are capitalised
const BAD_ENTRY =
    /^(Имена собственные|Топонимы|Формы существительных|Словоформы|Существительные во множественном числе|Pluralia tantum|Аббревиатуры)/;
const BAD_SENSE =
    /^(Жаргонизмы|Матерные|Обсценные|Вульгаризмы|Бранные|Диалектизмы|Регионализмы|Просторечные|Аббревиатуры|Компьютерный жаргон|Молодёжный сленг|Сленг|Пренебрежительные|Уничижительные|Оскорбительные|Презрительные|Ироничные)/;
const BAD_TAG = new Set([
    'form-of',
    'no-gloss',
    'plural',
    'slang',
    'abbreviation',
]);
const BAD_LABEL =
    /^(жарг|прост|диал|обл|бран|груб|вульг|сленг|мол|интернет|пренебр|презр|ирон)\./;

const LABELS_ONLY = /^([а-яё-]+\.[\s;]*)+$/;

type Sense = { glosses?: string[]; tags?: string[]; categories?: string[] };
type Entry = {
    word: string;
    lang_code?: string;
    pos?: string;
    categories?: string[];
    senses?: Sense[];
    sounds?: { audio?: string }[];
};

async function* lines(path: string) {
    const text = Bun.file(path)
        .stream()
        .pipeThrough(new DecompressionStream('gzip'))
        .pipeThrough(new TextDecoderStream());
    let rest = '';
    for await (const chunk of text) {
        const parts = (rest + chunk).split('\n');
        rest = parts.pop() ?? '';
        yield* parts;
    }
    if (rest) yield rest;
}

// Downloads once into .cache (not in git)
async function cached(url: string) {
    const path = `${CACHE_DIR}/${url.split('/').pop()}`;
    if (!(await Bun.file(path).exists())) {
        console.log(`Downloading ${url}`);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`);
        await mkdir(CACHE_DIR, { recursive: true });
        await Bun.write(path, res);
    }
    return path;
}

// Noun frequency in ipm; a pronoun or particle spelled like a noun (он, ли) has none
const ipm = new Map<string, number>();
const freqDir = `${CACHE_DIR}/freq2011`;
await Bun.$`unzip -o -q ${await cached(FREQ_URL)} -d ${freqDir}`;
for (const line of (await Bun.file(`${freqDir}/freqrnc2011.csv`).text()).split(
    '\n',
)) {
    const [lemma, pos, freq] = line.split('\t');
    if (pos !== 's') continue;
    const word = normalize(lemma);
    ipm.set(word, Math.max(ipm.get(word) ?? 0, Number(freq)));
}
const isCommon = (word: string, min = COMMON_IPM) =>
    (ipm.get(word) ?? 0) >= min;

const glosses = new Map<string, string[]>();
const heard = new Set<string>(); // words whose senses already start with a pronounced (common) homonym

for await (const line of lines(await cached(WIKTIONARY_URL))) {
    if (!line.includes('"lang_code": "ru"') || !line.includes('"pos": "noun"'))
        continue;
    const e: Entry = JSON.parse(line);
    if (e.lang_code !== 'ru' || e.pos !== 'noun' || !WORD.test(e.word))
        continue;
    const word = normalize(e.word);
    if (word.length < 2 || word.length > MAX_LEN) continue;
    if (e.categories?.some((c) => BAD_ENTRY.test(c))) continue;

    const senses = e.senses ?? [];
    const good = senses
        .filter(
            (s) =>
                !s.tags?.some((t) => BAD_TAG.has(t)) &&
                !s.categories?.some((c) => BAD_SENSE.test(c)),
        )
        .map((s) =>
            (s.glosses ?? [])
                .join(' ')
                .replace(/ ?\[\d+\]/g, '')
                .trim(),
        )
        // A sub-sense carries its parents' glosses; one ending in ':' only heads sub-senses that follow; a label alone (разг.) has no meaning in it
        .filter(
            (g) =>
                g &&
                !g.endsWith(':') &&
                !BAD_LABEL.test(g) &&
                !LABELS_ONLY.test(g),
        );
    if (!good.length) continue;

    // Homonyms merge (лён and лен are one word here). The first one with a recorded pronunciation is the common one, so it goes first.
    const known = glosses.get(word) ?? [];
    const first = !heard.has(word) && !!e.sounds?.some((s) => s.audio);
    if (first) heard.add(word);
    glosses.set(word, first ? [...good, ...known] : [...known, ...good]);
}

const words: Record<string, string> = {};
for (const [word, list] of [...glosses].sort(([a], [b]) =>
    a.localeCompare(b, 'ru'),
)) {
    const top = list.slice(0, MAX_SENSES);
    words[word] =
        top.length > 1
            ? top.map((g, i) => `${i + 1}) ${g}`).join('\n')
            : top[0];
}

const all = Object.keys(words).map((w) => [w, letterCounts(w)] as const);
const playable = new Set<string>(); // a word no source can make never shows up in a game
const sources = Object.keys(words).filter((source) => {
    if (source.length < MIN_SOURCE_LEN || !isCommon(source, SOURCE_IPM))
        return false;
    const counts = letterCounts(source);
    const found = all
        .filter(([w, c]) => w !== source && canMake(c, counts))
        .map(([w]) => w);
    if (found.filter((w) => isCommon(w)).length < MIN_COMMON) return false;
    for (const w of found) playable.add(w);
    playable.add(source);
    return true;
});
for (const w of Object.keys(words)) if (!playable.has(w)) delete words[w];

const common = Object.keys(words).filter((w) => isCommon(w));

await Bun.write(OUT, JSON.stringify({ sources, common, words }));
console.log(
    `${Object.keys(words).length} words (${common.length} common), ${sources.length} source words → ${OUT} (${(Bun.file(OUT).size / 1e6).toFixed(1)} MB)`,
);
