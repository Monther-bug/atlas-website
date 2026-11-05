import { useEffect } from 'react';
import { RequestBar } from '@/components/RequestBar';
import { loadAnalytics } from '@/lib/analytics';
import { useDeepLink } from '@/lib/deep-link';
import { useLang } from '@/lib/lang';
import { About } from '@/sections/About';
import { CraneGrid } from '@/sections/CraneGrid';
import { Documents } from '@/sections/Documents';
import { Footer } from '@/sections/Footer';
import { Header } from '@/sections/Header';
import { Hero } from '@/sections/Hero';
import { Hoist } from '@/sections/Hoist';
import { RequestForm } from '@/sections/RequestForm';
import { Services } from '@/sections/Services';
import { Sites } from '@/sections/Sites';
import { WhyAtlas } from '@/sections/WhyAtlas';
import { useSiteMotion } from '@/motion';
import '@/motion/motion.css';

export function App() {
  const { copy } = useLang();

  useSiteMotion();
  // /?crane=<id>#request and /?compare=<id>#crane-compare, from a crane page (src/lib/deep-link.ts).
  useDeepLink();

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="fixed start-3 top-3 z-50 -translate-y-24 bg-(--surface-raised) px-5 py-3 font-semibold text-(--surface-fg) transition-transform focus:translate-y-0"
      >
        {copy.header.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* v2 spec §5.3: the fleet is told in one run (showcase, then find + compare), then services, why, the photos. */}
        <Hero />
        <About />
        <Hoist />
        <CraneGrid />
        <Services />
        <WhyAtlas />
        <Sites />
        <Documents />
        <RequestForm />
      </main>
      <Footer />
      <RequestBar />
      <div data-progress-rope="" aria-hidden="true" className="progress-rope" />
    </>
  );
}

export default App;
