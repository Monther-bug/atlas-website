import { Fill } from '@/components/Fill';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { reveal } from '@/components/ui/Reveal';
import { Section, SectionHeader } from '@/components/ui/Section';
import { siteInfo } from '@/content/site';
import type { DocumentFile } from '@/content/types';
import { useLang } from '@/lib/lang';
import { fillTemplate, mailtoHref } from '@/lib/whatsapp';

/** Spec §5.7: not rendered until site.ts lists real files. */
export function Documents() {
  const { copy } = useLang();
  if (siteInfo.documents.length === 0) return null;
  return (
    <Section id="documents" surface="white" aria-labelledby="documents-title">
      <SectionHeader id="documents-title" title={copy.documents.title} lead={copy.documents.intro} />
      <ul {...reveal('stagger')} className="grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {siteInfo.documents.map((doc) => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </ul>
    </Section>
  );
}

function DocumentCard({ doc }: { doc: DocumentFile }) {
  const { copy } = useLang();
  const d = copy.documents;
  const name = (d.names as Record<string, string>)[doc.id] ?? doc.id;
  const link = 'inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:decoration-2';
  return (
    <Card as="li" tone="outline" interactive className="h-full">
      <Chip className="self-start">PDF</Chip>
      <h3 className="t-title mt-5">{name}</h3>
      <p className="t-small mt-2 text-(--surface-fg-2)">
        <Fill
          template={d.meta}
          vars={{ language: d.languages[doc.lang], date: <bdi className="tabular-nums">{doc.date}</bdi> }}
        />
      </p>
      <div className="mt-auto flex flex-wrap gap-x-6 gap-y-1 pt-6">
        <a href={doc.href} download className={link}>
          {d.download}
          <span className="sr-only">: {name}</span>
        </a>
        <a href={mailtoHref(fillTemplate(d.emailSubject, { document: name }), '')} className={link}>
          {d.emailRequest}
          <span className="sr-only">: {name}</span>
        </a>
      </div>
    </Card>
  );
}
