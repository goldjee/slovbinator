# Словбинатор

Grandmother-friendly word game for iPad: make as many nouns as possible from the letters of one long word. Sibling of Судокушка (../sudokushka, read-only): same stack, palette, hand-drawn buttons and dialogs.

- Next.js (App Router) static export (`output: "export"`, `basePath: "/slovbinator"`) deployed to GitHub Pages.
- Use bun: `bun run dev`, `bun test`, `bun run build`, `bun run lint`, `bun run format` (Biome: single quotes, 4 spaces).
- `bun run dictionary` rebuilds `public/dictionary.json` from the Russian Wiktionary (kaikki.org Wiktextract dump, CC BY-SA) and the НКРЯ noun frequencies (Ляшевская–Шаров, needs `unzip`); downloads are cached in `.cache/` (not in git).
- Rules: common nouns, singular, no slang; each letter of the source once; Е and Ё are one letter (`normalize`); source words 7–13 letters, ≥10 ipm.
- Every dictionary word the source makes is accepted. Words with ≥2 ipm as a noun are "common" (`dict.common`); the player wins by finding all common ones, rare ones get a `*` in the list.
- `src/lib/`: pure logic, unit-tested with `bun test`. `words.ts` letter counting (shared with the script), `game.ts` game state and word checks, `storage.ts` localStorage, `site.ts` base path.
- `src/components/`: `Game.tsx` owns state, loading and persistence; `Header`, `Source`, `Composer`, `FoundList`, `Dialogs` are presentational.
- Fonts: PT Serif Bold for the source word, headings and found words; PT Serif Caption for text; Cormorant Garamond Italic for glosses; Exo 2 for UI; Neucha for the word being typed.
- Russian UI only. Keep touch targets large.
