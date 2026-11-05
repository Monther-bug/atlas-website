import { useEffect } from 'react';
import { RequestBar } from '@/components/RequestBar';
import { loadAnalytics } from '@/lib/analytics';
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

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <>
      <a
        href="#main"
        className="fixed start-3 top-3 z-50 -translate-y-24 bg-white px-5 py-3 font-semibold text-ink transition-transform focus:translate-y-0"
      >
        {copy.header.skipLink}
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <About />
        <Hoist />
        <Services />
        <WhyAtlas />
        <CraneGrid />
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
