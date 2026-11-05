import type { CranePageCopy, Lang } from './types';

/**
 * The crane pages (/cranes/<id>/, /en/cranes/<id>/), copy deck §6c. Arabic composed first. Prerender-only: the page
 * body is a static island (src/crane-page/), so this file never reaches a browser bundle. Every figure on those pages
 * comes from cranes.ts / crane-specs.ts; these strings only frame them and claim nothing Atlas has not confirmed (no
 * ownership, no availability, no lift promised). Labels already in the deck are reused from ar.ts / en.ts and
 * crane-list-copy.ts instead of being repeated here.
 */
export const cranePageCopy: Record<Lang, CranePageCopy> = {
  ar: {
    meta: {
      title: '{name} · {type} | أطلس الصحراء',
      description: '{name} ({type}): {lead}الذراع الرئيسي {boom}. صور ومواصفات الشركة المصنّعة وطلب عبر واتساب.',
      capacity: 'أقصى حمولة {capacity} على نصف قطر {radius}، و',
      capacityNoRadius: 'أقصى حمولة {capacity}، و',
    },
    breadcrumb: { label: 'مسار الصفحة', home: 'الرئيسية', cranes: 'الرافعات' },
    hero: { form: 'استخدم نموذج الطلب' },
    highlights: {
      title: 'أهم الأرقام.',
      continuation: 'من الشركة المصنّعة، إلى جانب الطرازات الأربعة الأخرى.',
      lineup: 'أقصى حمولة للطرازات الخمسة',
      top: {
        boom: 'أطول ذراع رئيسي بين الطرازات الخمسة.',
        jib: 'أطول ذراع إضافي بين الطرازات الخمسة.',
        counterweight: 'أثقل ثقل موازنة بين الطرازات الخمسة.',
      },
      other: {
        boom: 'الأطول بين الخمسة: {value}، {model}.',
        jib: 'الأطول بين الخمسة: {value}، {model}.',
        counterweight: 'الأثقل بين الخمسة: {value}، {model}.',
      },
    },
    story: { label: 'صور الرافعة مع وصف كل صورة' },
    load: {
      title: 'هل ترفع حمولتك؟',
      lead: 'أقصى حمولة لها {capacity}، ولا تنطبق إلا على أقصر نصف قطر، وهو {radius}.',
      leadNoRadius: 'أقصى حمولة لها {capacity}، ولا تنطبق إلا على أقصر نصف قطر.',
      leadNoCapacity: 'أقصى حمولة لأي رافعة لا تنطبق إلا على أقصر نصف قطر.',
      rest: 'وعلى نصف قطر أطول أو ارتفاع أكبر ترفع أقل. أرسل لنا الوزن ونصف القطر وارتفاع الرفع، ونراجع جدول الأحمال معك.',
      needs: 'ما نحتاجه منك',
    },
    rail: { title: 'رافعات أخرى' },
    captions: {
      '6359': { site: null, text: 'من الأسفل: الكابينة والذراع التلسكوبي والخطاف' },
      '6360': { site: 'coast', text: 'ثقلا الموازنة لرافعتين جنباً إلى جنب' },
      '6363': { site: null, text: 'الكابينة، والذراع يرتفع فوقها في سماء غائمة' },
      '6364': { site: 'coast', text: 'المساند ممدودة وحزام الرفع على الخطاف' },
      '6374': { site: 'construction', text: 'ثقل موازنة أبيض بخطوط حمراء والذراع يرتفع نحو سماء زرقاء' },
      '6375': { site: 'construction', text: 'المساند على ألواح فولاذية' },
      '6376': { site: 'construction', text: 'كابينة المشغّل وبابها مفتوح' },
      '6379': { site: 'construction', text: 'كابينة المشغّل من الأسفل بدرجتها المعدنية' },
      '6380': { site: 'construction', text: 'رافعة مجنزرة بجانب مبنى من عدة طوابق' },
      '6382': { site: 'construction', text: 'جسم رافعة مجنزرة حمراء تحت الذراع الشبكي' },
      '6385': { site: 'construction', text: 'رافعة مجنزرة وكتل الموازنة مركّبة' },
      '6388': { site: 'construction', text: 'رافعة لكل التضاريس على قواعد المساند بجانب السقالات' },
      '6389': { site: 'construction', text: 'الذراع مرفوع والخطاف جاهز' },
      '6392': { site: null, text: 'من الزاوية الأمامية، والذراع مرفوع، على أرضية خرسانية' },
      '6393': { site: 'construction', text: 'جسم رافعة صفراء عليه اسم GROVE، والذراع يرتفع نحو سماء زرقاء' },
      '6395': { site: 'coast', text: 'رافعة لكل التضاريس بجانب مقطورة قلّابة' },
      '6396': { site: 'coast', text: 'رافعة لكل التضاريس والبحر خلفها' },
      '6397': { site: 'coast', text: 'المساند على قواعدها قرب البحر' },
    },
  },
  en: {
    meta: {
      title: '{name} · {type} | Atlas Alshraa',
      description: '{name} ({type}): {lead}main boom {boom}. Photos, the manufacturer specification and a request on WhatsApp.',
      capacity: 'max capacity {capacity} at {radius}, ',
      capacityNoRadius: 'max capacity {capacity}, ',
    },
    breadcrumb: { label: 'Breadcrumb', home: 'Home', cranes: 'Cranes' },
    hero: { form: 'Use the request form' },
    highlights: {
      title: 'Key figures.',
      continuation: 'From the manufacturer, beside the other four models.',
      lineup: 'Max capacity of the five models',
      top: {
        boom: 'The longest main boom of the five models.',
        jib: 'The longest jib of the five models.',
        counterweight: 'The heaviest counterweight of the five models.',
      },
      other: {
        boom: 'Longest of the five: {value}, {model}.',
        jib: 'Longest of the five: {value}, {model}.',
        counterweight: 'Heaviest of the five: {value}, {model}.',
      },
    },
    story: { label: 'Photos of the crane, each with a description' },
    load: {
      title: 'Will it lift your load?',
      lead: '{capacity} is its maximum, and only at its shortest radius, {radius}.',
      leadNoRadius: '{capacity} is its maximum, and only at its shortest radius.',
      leadNoCapacity: 'A crane’s maximum rating applies only at its shortest radius.',
      rest: 'Further out or higher up, it lifts less. Send us the weight, the radius and the lift height, and we will check the load chart with you.',
      needs: 'What we need from you',
    },
    rail: { title: 'Other cranes' },
    captions: {
      '6359': { site: null, text: 'From below: the cab, the telescopic boom and the hook' },
      '6360': { site: 'coast', text: 'Two counterweights side by side' },
      '6363': { site: null, text: 'The cab, with the boom rising into a cloudy sky' },
      '6364': { site: 'coast', text: 'Outriggers out, sling on the hook' },
      '6374': { site: 'construction', text: 'White counterweight with red chevrons, boom rising into a blue sky' },
      '6375': { site: 'construction', text: 'Outriggers on steel pads' },
      '6376': { site: 'construction', text: 'The operator’s cab, door open' },
      '6379': { site: 'construction', text: 'The operator’s cab from below, with its steel step' },
      '6380': { site: 'construction', text: 'Crawler crane beside a multi-storey frame' },
      '6382': { site: 'construction', text: 'Red crawler crane body under the lattice boom' },
      '6385': { site: 'construction', text: 'Crawler crane with its counterweight in place' },
      '6388': { site: 'construction', text: 'All-terrain crane on outrigger pads by the scaffolding' },
      '6389': { site: 'construction', text: 'Boom up, hook ready' },
      '6392': { site: null, text: 'From the front corner, boom raised, on a concrete yard' },
      '6393': { site: 'construction', text: 'Yellow crane body lettered GROVE, boom rising into a blue sky' },
      '6395': { site: 'coast', text: 'All-terrain crane beside a tipper trailer' },
      '6396': { site: 'coast', text: 'All-terrain crane with the sea behind' },
      '6397': { site: 'coast', text: 'Outriggers on pads near the water' },
    },
  },
};
