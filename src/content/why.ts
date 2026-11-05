import type { Lang, WhyCopy } from './types';

/**
 * Copy deck §8c, "Why Atlas" (v2). Arabic first. Only facts on hand: no years, counts of cranes, clients or
 * certificates. Every claim Atlas has not confirmed is a [[CONFIRM]] token (staging shows it; the prerender's HTML scan
 * blocks a production build while one is left). Says only what Services and the Hoist do not already say: the range
 * as one figure, which crane type suits which ground, how a hire runs, and how to ask.
 *
 * Imported only by the full render of src/sections/WhyAtlas.tsx, which runs in the prerender, the dev server and
 * tests. Client builds keep the prerendered HTML (src/sections/island.tsx), so these strings never ship in the main JS.
 */
export const whyCopy: Record<Lang, WhyCopy> = {
  ar: {
    title: 'لماذا أطلس الصحراء؟',
    continuation: 'رافعة بالحجم الذي يحتاجه عملك.',
    lead: 'مدى واسع من الرافعات، ونوع يناسب كل أرض، وطريقة عمل واضحة من أول رسالة حتى تصل الرافعة إلى موقعك.',
    range: {
      figure: 'من {min} إلى {max}',
      label: 'أقصى حمولة للرافعات المعروضة في هذه الصفحة، من الأصغر إلى الأكبر، حسب تصنيف الشركة المصنّعة.',
      listLabel: 'أقصى حمولة لكل طراز',
    },
    types: { title: 'لكل أرض رافعتها' },
    steps: {
      title: 'استئجار رافعة، خطوة بخطوة',
      items: [
        { title: 'أخبرنا بالحمولة والموقع', text: 'وزن الحمولة، ونصف قطر الرفع وارتفاعه، ومكان العمل.' },
        { title: 'نختار الرافعة المناسبة', text: 'نطابق رفعتك مع جدول الأحمال الصادر عن الشركة المصنّعة للرافعة.' },
        { title: 'نؤكد التوفر والموعد', text: 'نخبرك بالرافعة المتاحة، ومتى تصل إليك.' },
        { title: 'تصل الرافعة إلى موقعك', text: 'تُنصب في المكان المتفق عليه، وتبدأ الرفعة. [[CONFIRM: ومعها مشغّل ذو خبرة.]]' },
      ],
    },
    channels: {
      title: 'اسأل بالطريقة التي تناسبك',
      text: 'اختر رافعة من {list}، فيظهر اسمها جاهزاً في رسالتك وفي نموذج الطلب.',
      listLink: 'قائمة الرافعات',
      form: 'املأ نموذج الطلب',
    },
  },
  en: {
    title: 'Why Atlas Alshraa?',
    continuation: 'A crane the size your job needs.',
    lead: 'A wide range of cranes, a type for every kind of ground, and a clear way of working, from your first message until the crane reaches your site.',
    range: {
      figure: '{min}–{max}',
      label: 'Maximum capacity of the cranes on this page, smallest to largest, as rated by each maker.',
      listLabel: 'Maximum capacity by model',
    },
    types: { title: 'A crane for every kind of ground' },
    steps: {
      title: 'Hiring a crane, step by step',
      items: [
        { title: 'Tell us the load and the site', text: 'The load weight, the lift radius and height, and where the work is.' },
        { title: 'We match the right crane', text: "We check your lift against the crane maker's load chart." },
        { title: 'We confirm availability and dates', text: 'We tell you which crane is free, and when it can reach you.' },
        { title: 'The crane arrives on site', text: 'It is set up where we agreed, and the lift begins. [[CONFIRM: An experienced operator comes with it.]]' },
      ],
    },
    channels: {
      title: 'Ask the way that suits you',
      text: 'Pick a crane from {list} and its name is already filled in, in your message and in the request form.',
      listLink: 'the crane list',
      form: 'Fill in the request form',
    },
  },
};
