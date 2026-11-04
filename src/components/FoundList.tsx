import { useEffect, useRef } from 'react';

type Props = {
    found: string[];
    words: Record<string, string>;
    total: number;
    fresh: string | null; // just found, or found again: highlighted and scrolled to
};

export function FoundList({ found, words, total, fresh }: Props) {
    const list = useRef<HTMLUListElement>(null);

    useEffect(() => {
        if (!fresh) return;
        list.current
            ?.querySelector(`[data-word="${fresh}"]`)
            ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, [fresh]);

    return (
        <section className='found' aria-labelledby='found-title'>
            <header>
                <h2 id='found-title'>Найденные слова</h2>
                <span className='count'>
                    найдено {found.length} из {total}
                </span>
            </header>
            <ul ref={list}>
                {found.length === 0 && (
                    <li className='empty'>
                        Здесь появятся слова, которые вы составите
                    </li>
                )}
                {found.map((word) => (
                    <li
                        key={word}
                        data-word={word}
                        className={word === fresh ? 'fresh' : ''}
                    >
                        <div className='word'>{word}</div>
                        <div className='meaning'>{words[word]}</div>
                    </li>
                ))}
            </ul>
        </section>
    );
}
