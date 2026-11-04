import { expect, test } from 'bun:test';
import { check, createGame, type Dictionary, score } from './game';
import { normalize, subwords } from './words';

const dict: Dictionary = {
    sources: ['карандаш', 'приключение'],
    common: ['кадр', 'шар', 'каша'],
    words: {
        карандаш: '',
        приключение: '',
        кадр: '',
        шар: '',
        каша: '',
        шарада: '',
        кран: '',
        дар: '',
        лен: '',
        ключ: '',
    },
};

test('subwords use each letter of the source once', () => {
    const words = Object.keys(dict.words);
    // шарада needs three а and карандаш has three; каша needs two
    expect(subwords('карандаш', words).sort()).toEqual([
        'дар',
        'кадр',
        'каша',
        'кран',
        'шар',
        'шарада',
    ]);
    expect(subwords('шар', ['шар', 'шарада', 'ар'])).toEqual(['ар']);
});

test('е and ё are one letter', () => {
    expect(normalize('Лён')).toBe('лен');
    expect(subwords(normalize('ключение'), ['лен', 'ключ'])).toEqual([
        'лен',
        'ключ',
    ]);
});

test('check tells new, repeated, unknown and source words apart', () => {
    const game = { source: 'карандаш', found: ['шар'] };
    expect(check(game, 'кадр', dict)).toBe('ok');
    expect(check(game, 'шар', dict)).toBe('dup');
    expect(check(game, 'наш', dict)).toBe('not');
    expect(check(game, 'карандаш', dict)).toBe('self');
    expect(check(game, 'constructor', dict)).toBe('not');
});

test('a new game picks a different source word', () => {
    for (let i = 0; i < 20; i++)
        expect(createGame(dict, 'карандаш').source).toBe('приключение');
});

test('score counts common and rare words apart', () => {
    const answers = subwords('карандаш', Object.keys(dict.words));
    const common = new Set(dict.common);
    expect(score(['шар', 'дар'], answers, common)).toEqual({
        common: 1,
        commonTotal: 3,
        rare: 1,
        rareTotal: 3,
    });
});
