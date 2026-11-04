import type { Metadata, Viewport } from 'next';
import {
    Cormorant_Garamond,
    Exo_2,
    Neucha,
    PT_Serif,
    PT_Serif_Caption,
} from 'next/font/google';
import { BASE_PATH } from '@/lib/site';
import './globals.css';

// PT Serif Caption has no bold, so the source word and headings use PT Serif Bold
const text = PT_Serif_Caption({
    weight: '400',
    subsets: ['latin', 'cyrillic'],
    variable: '--font-text',
});
const bold = PT_Serif({
    weight: '700',
    subsets: ['latin', 'cyrillic'],
    variable: '--font-bold',
});
const gloss = Cormorant_Garamond({
    weight: '400',
    style: 'italic',
    subsets: ['latin', 'cyrillic'],
    variable: '--font-gloss',
});
const ui = Exo_2({
    weight: '400',
    subsets: ['latin', 'cyrillic'],
    variable: '--font-ui',
});
const hand = Neucha({
    weight: '400',
    subsets: ['latin', 'cyrillic'],
    variable: '--font-hand',
});

export const metadata: Metadata = {
    title: 'Словбинатор',
    description: 'Составьте как можно больше слов из букв одного длинного',
    appleWebApp: {
        capable: true,
        title: 'Словбинатор',
        statusBarStyle: 'default',
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#f6f1e3',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html
            lang='ru'
            data-theme='light'
            suppressHydrationWarning
            className={[text, bold, gloss, ui, hand]
                .map((f) => f.variable)
                .join(' ')}
        >
            <head>
                <script src={`${BASE_PATH}/theme.js`} />
            </head>
            <body>{children}</body>
        </html>
    );
}
