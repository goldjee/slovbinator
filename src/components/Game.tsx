'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
    check,
    createGame,
    type Dictionary,
    type Game as GameState,
    hintWait,
    revealHint,
    score,
    upgrade,
    type Verdict,
} from '@/lib/game';
import { BASE_PATH } from '@/lib/site';
import { KEY, load, save } from '@/lib/storage';
import { normalize, subwords } from '@/lib/words';
import { Composer } from './Composer';
import { HintDialog, NewWordDialog, WinDialog } from './Dialogs';
import { FoundList } from './FoundList';
import { Header, type Theme } from './Header';
import { Source } from './Source';

export default function Game() {
    const [dict, setDict] = useState<Dictionary | null>(null);
    const [failed, setFailed] = useState(false);
    const [game, setGame] = useState<GameState | null>(null);
    const [theme, setTheme] = useState<Theme>('light');
    const [picked, setPicked] = useState<number[]>([]); // tile indices, in tap order
    const [verdict, setVerdict] = useState<Verdict | null>(null);
    const [fresh, setFresh] = useState<string | null>(null);
    const [confirmNew, setConfirmNew] = useState(false);
    const [keepPlaying, setKeepPlaying] = useState(false); // after the win, to hunt rare words
    const [hint, setHint] = useState<string | null>(null); // the word whose gloss the hint shows
    const onKey = useRef((_: KeyboardEvent) => {});

    useEffect(() => {
        setTheme(document.documentElement.dataset.theme as Theme);
        fetch(`${BASE_PATH}/dictionary.json`)
            .then((r) => {
                if (!r.ok) throw new Error(`${r.status}`);
                return r.json() as Promise<Dictionary>;
            })
            .then((d) => {
                const saved = load<GameState>(KEY.game);
                // A rebuilt dictionary may have dropped the saved word
                setGame(
                    saved && d.sources.includes(saved.source)
                        ? upgrade(saved)
                        : createGame(d),
                );
                setDict(d);
            })
            .catch(() => setFailed(true));
    }, []);

    useEffect(() => {
        const listener = (e: KeyboardEvent) => onKey.current(e);
        document.addEventListener('keydown', listener);
        return () => document.removeEventListener('keydown', listener);
    }, []);

    useEffect(() => {
        if (game) save(KEY.game, game);
    }, [game]);

    useEffect(() => {
        if (dict) document.documentElement.dataset.theme = theme;
    }, [dict, theme]);

    const running = !!game;
    useEffect(() => {
        if (!running) return;
        let last = Date.now();
        const id = setInterval(() => {
            const now = Date.now();
            // Cap the step so time spent asleep or in the background never counts.
            const step = Math.min(now - last, 1500);
            last = now;
            if (document.visibilityState === 'visible')
                setGame((g) => g && { ...g, elapsed: g.elapsed + step });
        }, 1000);
        return () => clearInterval(id);
    }, [running]);

    const words = useMemo(() => (dict ? Object.keys(dict.words) : []), [dict]);
    const common = useMemo(() => new Set(dict?.common), [dict]);
    const source = game?.source;
    const answers = useMemo(
        () => (source ? subwords(source, words) : []),
        [source, words],
    );

    if (failed)
        return (
            <main className='app'>
                <div className='loading'>
                    <p>Не удалось загрузить словарь. Проверьте интернет.</p>
                    <button
                        type='button'
                        className='btn big'
                        onClick={() => location.reload()}
                    >
                        Попробовать снова
                    </button>
                </div>
            </main>
        );
    if (!dict || !game)
        return (
            <main className='app'>
                <p className='loading'>Загружаю словарь…</p>
            </main>
        );

    const typed = picked.map((i) => game.source[i]).join('');
    const points = score(game.found, answers, common);
    const won = points.common === points.commonTotal;
    const showWin = won && !keepPlaying;

    function pick(i: number) {
        setPicked([...picked, i]);
        setVerdict(null);
        setFresh(null);
    }

    function edit(next: number[]) {
        setPicked(next);
        setVerdict(null);
    }

    function onCheck() {
        if (!dict || !game || !typed) return;
        const v = check(game, typed, dict);
        setVerdict(v);
        if (v === 'ok') setGame({ ...game, found: [typed, ...game.found] });
        if (v === 'ok' || v === 'dup') {
            setFresh(typed);
            setPicked([]);
        }
    }

    function startNew() {
        if (!dict || !game) return;
        setGame(createGame(dict, game.source));
        setPicked([]);
        setVerdict(null);
        setFresh(null);
        setConfirmNew(false);
        setKeepPlaying(false);
        setHint(null);
    }

    function onHint() {
        const next = game && revealHint(game, answers, common);
        if (!next) return;
        setGame(next.game);
        setHint(next.word);
    }

    onKey.current = (e) => {
        if (confirmNew || showWin || hint || e.ctrlKey || e.metaKey || e.altKey)
            return;
        if (e.key === 'Backspace') edit(picked.slice(0, -1));
        else if (e.key === 'Enter') onCheck();
        else {
            const letter = normalize(e.key);
            const i = [...game.source].findIndex(
                (l, i) => l === letter && !picked.includes(i),
            );
            if (i >= 0) pick(i);
        }
    };

    return (
        <main className='app'>
            <Header
                theme={theme}
                onToggleTheme={() => {
                    const next = theme === 'light' ? 'dark' : 'light';
                    setTheme(next);
                    // Saved only on an explicit choice, so untouched devices keep following the system.
                    save(KEY.theme, next);
                }}
                onNewWord={() =>
                    game.found.length && !won ? setConfirmNew(true) : startNew()
                }
            />
            <Source
                source={game.source}
                gloss={dict.words[game.source]}
                picked={picked}
                onPick={pick}
            />
            <div className='play'>
                <Composer
                    typed={typed}
                    verdict={verdict}
                    onErase={() => edit(picked.slice(0, -1))}
                    onClear={() => edit([])}
                    onCheck={onCheck}
                    hintWait={hintWait(game)}
                    onHint={onHint}
                />
                <FoundList
                    found={game.found}
                    words={dict.words}
                    common={common}
                    score={points}
                    fresh={fresh}
                />
            </div>
            <NewWordDialog
                open={confirmNew}
                onConfirm={startNew}
                onCancel={() => setConfirmNew(false)}
            />
            <HintDialog
                open={!!hint}
                gloss={hint ? dict.words[hint] : ''}
                onClose={() => setHint(null)}
            />
            <WinDialog
                open={showWin}
                score={points}
                onNewWord={startNew}
                onKeepPlaying={() => setKeepPlaying(true)}
            />
        </main>
    );
}
