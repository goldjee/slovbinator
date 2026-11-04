import type { Verdict } from '@/lib/game';

const MESSAGES: Record<Verdict, string> = {
    ok: 'Есть такое слово!',
    dup: 'Это слово уже есть в списке',
    not: 'Такого слова нет в словаре',
    self: 'Это и есть исходное слово',
};

// Line icons in the same stroke style as the theme toggle (.icon).
const ICONS = {
    backspace:
        'M10 5a2 2 0 0 0-1.3.5l-6.4 5.8a1 1 0 0 0 0 1.4l6.4 5.8A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zM12 9l6 6M18 9l-6 6',
    erase: 'M7 21l-4.3-4.3a2.4 2.4 0 0 1 0-3.4l9.6-9.6a2.4 2.4 0 0 1 3.4 0l5.6 5.6a2.4 2.4 0 0 1 0 3.4L13 21M22 21H7M5 11l9 9',
    // open book: looks the word up in the dictionary
    check: 'M12 7v14M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z',
};

const Icon = ({ d }: { d: string }) => (
    <svg className='icon' viewBox='0 0 24 24' aria-hidden='true'>
        <path d={d} />
    </svg>
);

type Props = {
    typed: string;
    verdict: Verdict | null;
    onErase: () => void;
    onClear: () => void;
    onCheck: () => void;
};

export function Composer({ typed, verdict, onErase, onClear, onCheck }: Props) {
    const bad = verdict === 'not' || verdict === 'self';
    return (
        <section className='composer' aria-label='Составление слова'>
            <div className={`typed ${typed && bad ? 'bad' : ''}`}>
                {typed || (
                    <span className='hint'>
                        Нажимайте на буквы, чтобы составить слово
                    </span>
                )}
            </div>
            <p className={`message ${verdict ?? ''}`} role='status'>
                {verdict && MESSAGES[verdict]}
            </p>
            <div className='tools'>
                <button
                    type='button'
                    className='btn'
                    onClick={onErase}
                    disabled={!typed}
                >
                    <Icon d={ICONS.backspace} />
                    <span>Стереть букву</span>
                </button>
                <button
                    type='button'
                    className='btn'
                    onClick={onClear}
                    disabled={!typed}
                >
                    <Icon d={ICONS.erase} />
                    <span>Стереть всё</span>
                </button>
            </div>
            <button
                type='button'
                className='btn check'
                onClick={onCheck}
                disabled={!typed}
            >
                <Icon d={ICONS.check} />
                <span>Проверить</span>
            </button>
            <p className='credit'>
                Слова и толкования из{' '}
                <a
                    href='https://ru.wiktionary.org/'
                    target='_blank'
                    rel='noreferrer'
                >
                    Викисловаря
                </a>{' '}
                (CC BY-SA)
            </p>
        </section>
    );
}
