import { type ReactNode, useId, useRef, useState } from 'react';
import type { Score } from '@/lib/game';

type DialogProps = {
    open: boolean;
    title: string;
    closeLabel?: string;
    onClose?: () => void; // shows a close button in the corner
    children: ReactNode;
};

// Stays mounted after `open` turns false until the closing animation ends.
function Dialog({ open, title, closeLabel, onClose, children }: DialogProps) {
    const titleId = useId();
    const [shown, setShown] = useState(open);
    if (open && !shown) setShown(true);
    // Freeze the content while closing, so it doesn't change under the fade (e.g. the loss warning after a new game).
    const content = useRef(children);
    if (open) content.current = children;
    if (!shown) return null;
    return (
        <div
            className={`overlay ${open ? '' : 'closing'}`}
            role='dialog'
            aria-modal='true'
            aria-labelledby={titleId}
            onAnimationEnd={(e) =>
                !open && e.target === e.currentTarget && setShown(false)
            }
        >
            <div className='dialog'>
                <h2 id={titleId}>{title}</h2>
                {content.current}
                {onClose && (
                    <button
                        type='button'
                        className='btn close'
                        aria-label={closeLabel}
                        onClick={onClose}
                    >
                        <svg
                            className='icon'
                            viewBox='0 0 24 24'
                            aria-hidden='true'
                        >
                            <path d='M6 6l12 12M18 6L6 18' />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

type NewWordProps = {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

export function NewWordDialog({ open, onConfirm, onCancel }: NewWordProps) {
    return (
        <Dialog
            open={open}
            title='Новое слово'
            closeLabel='Отмена'
            onClose={onCancel}
        >
            <p className='warn'>Текущая игра будет потеряна</p>
            <button type='button' className='btn big' onClick={onConfirm}>
                Новое слово
            </button>
            <button type='button' className='btn big cancel' onClick={onCancel}>
                Отмена
            </button>
        </Dialog>
    );
}

type WinProps = {
    open: boolean;
    score: Score;
    onNewWord: () => void;
    onKeepPlaying: () => void;
};

export function WinDialog({ open, score, onNewWord, onKeepPlaying }: WinProps) {
    return (
        <Dialog open={open} title='Все обычные слова найдены!'>
            <p>
                Редких слов найдено {score.rare} из {score.rareTotal}
            </p>
            <button type='button' className='btn big' onClick={onNewWord}>
                Новое слово
            </button>
            <button
                type='button'
                className='btn big cancel'
                onClick={onKeepPlaying}
            >
                Искать редкие
            </button>
        </Dialog>
    );
}
