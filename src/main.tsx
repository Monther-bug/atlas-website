import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { App } from '@/App';
import type { Lang } from '@/content/types';
import { LangProvider } from '@/lib/lang';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('#root is missing from the page');

// Each HTML entry declares its language on <html> (index.html = ar, en/index.html = en).
const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'ar';

const app = (
  <StrictMode>
    <LangProvider lang={lang}>
      <App />
    </LangProvider>
  </StrictMode>
);

// Prerendered pages (Part E) already hold the markup: hydrate it. Before prerendering, #root holds
// nothing or only E's `<!--app-->` comment (not an element), so createRoot is used and clears it.
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);
