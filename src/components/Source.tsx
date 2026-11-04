type Props = {
    source: string;
    gloss: string;
    picked: number[];
    onPick: (index: number) => void;
};

export function Source({ source, gloss, picked, onPick }: Props) {
    return (
        <section className='source' aria-label='Исходное слово'>
            <div className='tiles'>
                {[...source.toUpperCase()].map((letter, i) => {
                    const used = picked.includes(i);
                    return (
                        <button
                            type='button'
                            // biome-ignore lint/suspicious/noArrayIndexKey: a tile is a position in the word
                            key={i}
                            className='btn tile'
                            aria-pressed={used}
                            aria-label={
                                used ? `${letter}, уже в слове` : letter
                            }
                            onClick={() => !used && onPick(i)}
                        >
                            <span>{letter}</span>
                        </button>
                    );
                })}
            </div>
            <p className='gloss'>{gloss}</p>
        </section>
    );
}
