# Словбинатор

Составьте как можно больше слов из букв одного длинного. Игра для iPad: https://goldjee.github.io/slovbinator/

```bash
bun install
bun run dev         # http://localhost:3000
bun test
bun run build       # static export to out/
bun run dictionary  # rebuild public/dictionary.json
```

Слова и толкования взяты из [Викисловаря](https://ru.wiktionary.org/) (выгрузка [kaikki.org](https://kaikki.org/ruwiktionary/)), лицензия [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Исходные слова отобраны по частотному списку [FrequencyWords](https://github.com/hermitdave/FrequencyWords) (CC BY-SA 4.0). Файл `public/dictionary.json` распространяется на тех же условиях; код — под лицензией MIT.
