import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { lenisRef, noop, type MotionModule } from './shared';

/* Ownership: startProgressRope is the sole writer of [data-progress-rope] (transform + .is-live); other modules only read its rect. */
/** Desktop: a 1 px red line on the reading-start edge whose length is the page's scroll progress (v2 keeps it; the footer pad is gone). */
export const startProgressRope: MotionModule = () => {
  const rope = document.querySelector<HTMLElement>('[data-progress-rope]');
  if (!rope) return noop;
  // The Hoist's rope hands over here (D.5 exit). Without a Services section, go live after the Hoist.
  const handover = document.getElementById('services') ?? document.getElementById('cranes');
  const ctx = gsap.context(() => {
    gsap.fromTo(
      rope,
      { scaleY: 0 },
      { scaleY: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3, invalidateOnRefresh: true } },
    );
    if (handover) {
      ScrollTrigger.create({
        trigger: handover,
        start: 'top bottom',
        end: () => ScrollTrigger.maxScroll(window) + 1,
        onToggle: (self) => rope.classList.toggle('is-live', self.isActive),
      });
    }
  });
  return () => {
    ctx.revert();
    rope.classList.remove('is-live');
  };
};

/** "Back to top" is a hook that hoists you up: the icon lifts; on desktop Lenis glides to 0. */
export const startBackToTop: MotionModule = () => {
  const ctx = gsap.context(() => {});
  const onClick = (event: MouseEvent) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-back-to-top]') : null;
    if (!link) return;
    const icon = link.querySelector('svg') ?? link;
    ctx.add(() => {
      gsap.fromTo(icon, { y: 0 }, { y: -8, duration: 0.22, ease: 'power2.in', yoyo: true, repeat: 1, clearProps: 'transform' });
    });

    const lenis = lenisRef.current;
    if (!lenis) return; // touch: the browser follows href="#top" itself
    event.preventDefault();
    lenis.scrollTo(0, {
      duration: 1.4,
      onComplete: () => {
        history.replaceState(null, '', '#top');
        document.querySelector<HTMLElement>('[data-header] a[href], [data-header] button')?.focus({ preventScroll: true });
      },
    });
  };
  // Capture phase, before core's anchor handler (which ignores defaultPrevented clicks).
  document.addEventListener('click', onClick, true);
  return () => {
    document.removeEventListener('click', onClick, true);
    ctx.revert();
  };
};
