# Словбинатор

Составьте как можно больше слов из букв одного длинного. Игра для iPad: https://goldjee.github.io/slovbinator/

```bash
bun install
bun run dev         # http://localhost:3000
bun test
bun run build       # static export to out/
bun run dictionary  # rebuild public/dictionary.json
```

Слова и толкования взяты из [Викисловаря](https://ru.wiktionary.org/) (выгрузка [kaikki.org](https://kaikki.org/ruwiktionary/)), лицензия [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Обычные и исходные слова отобраны по частотам существительных из словаря: Ляшевская О. Н., Шаров С. А. Частотный словарь современного русского языка (на материалах Национального корпуса русского языка). М.: Азбуковник, 2009. [dict.ruslang.ru/freq.php](http://dict.ruslang.ru/freq.php). Файл `public/dictionary.json` распространяется на условиях CC BY-SA 4.0; код — под лицензией MIT.
