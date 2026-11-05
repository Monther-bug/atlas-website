import { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';
import type { Copy, Lang } from '@/content/types';

export interface LangValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  copy: Copy;
  otherLang: Lang;
  otherHref: string; // '/en/' or '/'
}

const LangContext = createContext<LangValue | null>(null);

export function LangProvider({ lang, copy, children }: { lang: Lang; copy: Copy; children: ReactNode }): JSX.Element {
  const value = useMemo<LangValue>(
    () => ({
      lang,
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      copy,
      otherLang: lang === 'ar' ? 'en' : 'ar',
      otherHref: lang === 'ar' ? '/en/' : '/',
    }),
    [lang, copy],
  );
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang() must be called inside <LangProvider>.');
  return value;
}
