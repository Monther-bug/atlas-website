import type { CraneListCopy, Lang } from './types';

/**
 * «اعثر على رافعتك»: copy for the parts that load on demand (load check, detail sheet, comparison). Kept out of
 * ar.ts / en.ts so it ships in those lazy chunks, not in the initial bundle (the prerender imports it directly).
 * Arabic is composed first; the same copy rules apply (src/content/crane-list-copy.test.ts). Copy deck §6.
 */
export const craneListCopy: Record<Lang, CraneListCopy> = {
  ar: {
    load: {
      title: 'قارن حمولتك بالتصنيفات',
      label: 'وزن الحمولة',
      unit: 'طن',
      caveat:
        'أقصى حمولة تنطبق على أقصر نصف قطر فقط. ما ترفعه الرافعة فعلاً يعتمد على نصف القطر وتجهيزها، فأرسل لنا الوزن ونصف القطر لنراجع جدول الأحمال معك.',
      cta: 'أرسل الوزن ونصف القطر',
      clear: 'امسح وزن الحمولة',
      invalid: 'اكتب الوزن بالطن بالأرقام، مثل 25 أو 12.5.',
      result: {
        none: 'لا يوجد طراز هنا تصنيفه الأقصى {load} أو أكثر. أرسل لنا التفاصيل لنراجعها.',
        one: 'طراز واحد تصنيفه الأقصى {load} أو أكثر.',
        two: 'طرازان تصنيفهما الأقصى {load} أو أكثر.',
        few: '{n} طرازات تصنيفها الأقصى {load} أو أكثر.',
        many: '{n} طرازاً تصنيفها الأقصى {load} أو أكثر.',
      },
  },
  sheet: {
    whatsapp: 'اسأل عنها على واتساب',
    compareWith: 'قارنها بطرازات أخرى',
    photos: 'صور {name}',
    noteHeading: 'عن هذا التصنيف',
    sourcesHeading: 'مصادر الأرقام',
  },
  compare: {
    title: 'قارن الطرازات',
    lead: 'اختر حتى ثلاث رافعات لتقارن مواصفاتها جنباً إلى جنب.',
    pickerLabel: 'الطرازات في المقارنة',
    limit: 'ثلاث رافعات كحدّ أقصى، فأُزيلت أقدم رافعة اخترتها.',
      request: 'اطلبها',
    needTwo: 'اختر رافعة ثانية لتبدأ المقارنة.',
    tableName: 'مقارنة مواصفات الرافعات',
    missing: 'غير مذكور في وثيقة الشركة المصنّعة',
    missingNote: '— تعني أن وثيقة الشركة المصنّعة لا تذكر هذا الرقم لهذا الطراز. نتركه فارغاً ولا نقدّره.',
    secondary: 'من قاعدة بيانات مواصفات',
    secondaryNote: '* من قاعدة بيانات مواصفات، لا من وثيقة الشركة المصنّعة.',
    notesHeading: 'ملاحظات على التصنيفات',
  },
  groups: {
    lifting: 'الرفع',
    boom: 'الذراع الرئيسي والإضافي',
    carrier: 'الهيكل والقيادة',
    engine: 'المحرك والسير',
    dimensions: 'الأبعاد والأوزان',
  },
  dims: { length: 'الطول الكلي', width: 'العرض الكلي', height: 'الارتفاع الكلي' },
  conflict: { label: 'حسب اسم الطراز، بانتظار التأكيد', mark: 'انظر ملاحظة هذا التصنيف' },
  capacityNotes: {
    rt700e: 'تصنيفها 60 طناً أمريكياً، أي 55 طناً مترياً: الرقمان للتصنيف نفسه بوحدتين مختلفتين.',
    'atf60-3':
      'تبلغ 60 طناً على نصف قطر 2.5 م فوق الخلف ومع تجهيزات إضافية؛ وفي نطاق العمل المعتاد يبيّن الجدول 55 طناً على 2.5 م.',
    'ac200-1': 'تصنيف 200 طن يحتاج تجهيزاً خاصاً، وينطبق على نصف قطر قصير لم نتمكّن من قراءته بدقة من الجدول.',
    quy250: 'صفحة Fuwa تذكر 260 طناً، واسم الطراز يقول 250 طناً، وهو الرقم الذي نستخدمه في بقية الصفحة إلى أن تؤكّده أطلس.',
    gmk6350: 'تصنيفها 350 طناً أمريكياً، أي 317.5 طناً مترياً، محوّلة من 700 ألف رطل على 8 أقدام.',
  },
  },
  en: {
    load: {
      title: 'Check your load against the ratings',
      label: 'Load weight',
      unit: 't',
      caveat:
        'A maximum rating applies only at the shortest radius. What a crane can really lift depends on the radius and its set-up, so send us the weight and radius and we will check the load chart with you.',
      cta: 'Send the weight and radius',
      clear: 'Clear the load weight',
      invalid: 'Enter the weight in tonnes, for example 25 or 12.5.',
      result: {
        none: 'No model here has a maximum rating of {load} or more. Send us the details and we will look at them.',
        one: '1 model has a maximum rating of {load} or more.',
        two: '2 models have a maximum rating of {load} or more.',
        few: '{n} models have a maximum rating of {load} or more.',
        many: '{n} models have a maximum rating of {load} or more.',
      },
  },
  sheet: {
    whatsapp: 'Ask on WhatsApp',
    compareWith: 'Compare with other models',
    photos: '{name} photos',
    noteHeading: 'About this rating',
    sourcesHeading: 'Where the figures come from',
  },
  compare: {
    title: 'Compare models',
    lead: 'Choose up to three cranes to compare their specifications side by side.',
    pickerLabel: 'Models in the comparison',
    limit: 'Three at most, so your oldest pick made room.',
      request: 'Request',
    needTwo: 'Choose a second crane to start comparing.',
    tableName: 'Crane specification comparison',
    missing: 'Not stated by the manufacturer',
    missingNote: '— means the manufacturer’s document does not state this figure for this model. We leave it blank rather than estimate it.',
    secondary: 'from a spec database',
    secondaryNote: '* From a spec database, not from the manufacturer’s own document.',
    notesHeading: 'Notes on the ratings',
  },
  groups: {
    lifting: 'Lifting',
    boom: 'Boom and jib',
    carrier: 'Carrier',
    engine: 'Engine and travel',
    dimensions: 'Dimensions and weights',
  },
  dims: { length: 'Overall length', width: 'Overall width', height: 'Overall height' },
  conflict: { label: 'From the model name, to be confirmed', mark: 'see the note on this rating' },
  capacityNotes: {
    rt700e: 'Rated 60 US tons, which is 55 metric tonnes: the same rating in two units.',
    'atf60-3': '60 t is over the rear at 2.5 m with additional equipment; over the standard working range the chart shows 55 t at 2.5 m.',
    'ac200-1': 'The 200 t rating needs a special attachment and applies at a short radius we could not read reliably from the chart.',
    quy250: 'Fuwa’s page states 260 t; the model name says 250 t, the figure we use elsewhere on this page until Atlas confirms it.',
    gmk6350: 'Rated 350 US tons, which is 317.5 metric tonnes, converted from 700,000 lb at 8 ft.',
  },
  },
};
