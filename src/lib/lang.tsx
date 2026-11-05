import { createContext, useContext, useMemo, type JSX, type ReactNode } from 'react';
import type { CraneId, Copy, Lang } from '@/content/types';

export interface LangValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  copy: Copy;
  otherLang: Lang;
  /** The same page in the other language: '/en/' or '/' on the home page, '/en/cranes/<id>/' ↔ '/cranes/<id>/' on a crane page. */
  otherHref: string;
  /** This language's home page: '/' or '/en/'. */
  home: string;
  /** The page below the language root: '' for the home page, 'cranes/<id>/' for a crane page. */
  path: string;
  /** The crane a crane page is about (null on the home page). */
  crane: CraneId | null;
}

const LangContext = createContext<LangValue | null>(null);

const ROOT: Record<Lang, string> = { ar: '/', en: '/en/' };

export function LangProvider({
  lang,
  copy,
  crane = null,
  children,
}: {
  lang: Lang;
  copy: Copy;
  /** Set on a crane page (/cranes/<id>/): links to home sections then point at the home page, the language switch at the same crane. */
  crane?: CraneId | null;
  children: ReactNode;
}): JSX.Element {
  const value = useMemo<LangValue>(() => {
    const otherLang: Lang = lang === 'ar' ? 'en' : 'ar';
    const path = crane ? `cranes/${crane}/` : '';
    return { lang, dir: lang === 'ar' ? 'rtl' : 'ltr', copy, otherLang, otherHref: ROOT[otherLang] + path, home: ROOT[lang], path, crane };
  }, [lang, copy, crane]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error('useLang() must be called inside <LangProvider>.');
  return value;
}

/**
 * A link to a section of the home page: the bare hash on the home page itself ('#services'), the home page plus the
 * hash anywhere else ('/#services', '/en/#services').
 */
export function homeHref(value: Pick<LangValue, 'home' | 'path'>, hash: string): string {
  return value.path ? `${value.home}${hash}` : hash;
}
