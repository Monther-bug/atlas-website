import { Fill } from '@/components/Fill';
import { siteInfo } from '@/content/site';
import type { DocumentFile } from '@/content/types';
import { useLang } from '@/lib/lang';
import { fillTemplate, mailtoHref } from '@/lib/whatsapp';

/** Spec §5.7: not rendered until site.ts lists real files. */
export function Documents() {
  const { copy } = useLang();
  if (siteInfo.documents.length === 0) return null;
  return (
    <section id="documents" aria-labelledby="documents-title" className="section-y bg-white text-ink">
      <div className="shell">
        <h2 id="documents-title" className="t-h2 text-balance text-navy">
          {copy.documents.title}
        </h2>
        <p className="t-lead measure mt-5">{copy.documents.intro}</p>
        <ul className="mt-12 border-t border-line">
          {siteInfo.documents.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function DocumentRow({ doc }: { doc: DocumentFile }) {
  const { copy } = useLang();
  const d = copy.documents;
  const name = (d.names as Record<string, string>)[doc.id] ?? doc.id;
  const link = 'inline-flex min-h-11 items-center font-semibold text-navy underline hover:decoration-2';
  return (
    <li className="grid gap-3 border-b border-line py-6 md:grid-cols-12 md:items-center md:gap-8">
      <p className="t-h3 text-navy md:col-span-5">{name}</p>
      <p className="t-small text-ink/75 md:col-span-4">
        <Fill template={d.meta} vars={{ language: d.languages[doc.lang], date: <bdi className="tabular-nums">{doc.date}</bdi> }} />
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 md:col-span-3 md:justify-end">
        <a href={doc.href} download className={link}>
          {d.download}
          <span className="sr-only">: {name}</span>
        </a>
        <a href={mailtoHref(fillTemplate(d.emailSubject, { document: name }), '')} className={link}>
          {d.emailRequest}
          <span className="sr-only">: {name}</span>
        </a>
      </div>
    </li>
  );
}
