import { NewTabNote, externalProps } from '@/components/Button';
import { ArrowIcon, DerrickIcon } from '@/components/Icons';
import { track } from '@/lib/analytics';
import { useLang } from '@/lib/lang';
import { fillTemplate, whatsappHref } from '@/lib/whatsapp';

export function Services() {
  const { copy } = useLang();
  return (
    <section id="services" data-ground="dark" aria-labelledby="services-title" className="section-y bg-navy-950 text-white">
      <div className="shell">
        <h2 id="services-title" className="t-h2 text-balance">
          {copy.services.title}
        </h2>
        <p className="t-lead measure mt-5 text-steel">{copy.services.intro}</p>
        <ul role="list" className="mt-14 border-t border-line-dark">
          {copy.services.items.map((service) => {
            const href = whatsappHref(fillTemplate(copy.whatsapp.service, { service: service.title }));
            const ext = externalProps(href);
            return (
              <li
                key={service.id}
                data-service-row=""
                className="grid gap-4 border-b border-line-dark py-8 md:grid-cols-12 md:gap-10 md:py-10"
              >
                <h3 className="t-h3 flex items-center gap-3 md:col-span-4">
                  {service.id === 'oil-services' && <DerrickIcon className="size-8 shrink-0 text-steel" />}
                  <span>{service.title}</span>
                </h3>
                <div className="md:col-span-8">
                  <p className="t-body measure text-white/90">{service.body}</p>
                  {service.confirm && <p className="t-body measure mt-3 text-white/90">{service.confirm}</p>}
                  <a
                    href={href}
                    {...ext}
                    onClick={() => track('whatsapp_click', { location: 'services', service: service.id })}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-red-bright hover:decoration-2"
                  >
                    {copy.services.ask}
                    <span className="sr-only">: {service.title}</span>
                    <ArrowIcon className="size-4" />
                    {ext.target && <NewTabNote />}
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
