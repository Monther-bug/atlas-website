import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { Button, NewTabNote, externalProps } from '@/components/Button';
import { Fill } from '@/components/Fill';
import { HookIcon, PhoneIcon, WhatsAppIcon } from '@/components/Icons';
import { Chip } from '@/components/ui/Chip';
import { fieldClass } from '@/components/ui/Field';
import { Reveal, reveal } from '@/components/ui/Reveal';
import { Section, SectionHeader } from '@/components/ui/Section';
import { siteInfo, visibleCranes } from '@/content';
import { env } from '@/env';
import { track } from '@/lib/analytics';
import { toAsciiDigits } from '@/lib/digits';
import { useLang } from '@/lib/lang';
import { formatNumber } from '@/lib/numbers';
import { getRequestedCrane, setRequestedCrane, useRequestedCrane } from '@/lib/request';
import { mailtoHref, telHref, whatsappHref } from '@/lib/whatsapp';
import {
  DURATIONS,
  LIMITS,
  buildFollowUpMessage,
  handoffMessage,
  craneFromOption,
  craneOrServiceLabel,
  craneOptionValue,
  emailSubject,
  emptyRequest,
  localIsoDate,
  requestPayload,
  serviceOptionValue,
  validateRequest,
  type RequestErrors,
  type RequestField,
  type RequestValues,
} from './request-form-logic';

/** Fields behind the one disclosure. They open it when they hold a value or an error. */
const MORE_FIELDS: readonly RequestField[] = ['company', 'radius', 'height', 'start', 'duration', 'message'];
/** Order on screen, which is also the order of the error summary. */
const FORM_ORDER: readonly RequestField[] = ['phone', 'weight', 'crane', 'site', 'name', ...MORE_FIELDS];

type Status = 'idle' | 'handoff' | 'sending' | 'sent' | 'failed' | 'offline';
const TIMEOUT_MS = 10_000;
const HANDOFF_LOCK_MS = 3000;

/** Field control: the v2 `fieldClass` (52 px, 14 px radius, 3:1 border) plus a unit gutter or multiline height. */
function controlClass({ unit = false }: { unit?: boolean } = {}): string {
  return `${fieldClass} ${unit ? 'pe-12' : ''}`;
}
const TEXT_LINK = 'inline-flex min-h-11 items-center font-semibold underline underline-offset-4 hover:decoration-2';

export function RequestForm() {
  const { copy } = useLang();
  const f = copy.form;
  return (
    <Section id="request" surface="night" aria-labelledby="request-title">
      <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal kind="rise" className="lg:sticky lg:top-28 lg:col-span-5">
          <SectionHeader id="request-title" title={f.title} lead={f.lead} className="mb-0" />
          <Channels />
          <NextSteps />
        </Reveal>
        <div {...reveal('fade')} className="lg:col-span-7">
          {/* The form sits on a white card: its own light ground, so the Field primitives read dark-on-white. */}
          <div data-ground="light" className="surface-white rounded-xl p-6 shadow-e4 sm:p-8 lg:p-10">
            <RequestFormBody />
          </div>
        </div>
      </div>
    </Section>
  );
}

/** Direct channels: WhatsApp (red pill), call, email. Only the ones that exist are shown. */
function Channels() {
  const { copy, lang } = useLang();
  const c = copy.form.contact;
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;
  return (
    <div className="mt-10">
      <div className="flex flex-wrap gap-3">
        {whatsapp && env.whatsapp && (
          <Button
            href={whatsapp}
            external
            size="md"
            icon={<WhatsAppIcon className="size-5" />}
            onClick={() => track('whatsapp_click', { location: 'form' })}
          >
            {c.whatsapp}
          </Button>
        )}
        {tel && env.phone && (
          <Button
            href={tel}
            variant="ghost-dark"
            size="md"
            icon={<PhoneIcon className="size-5" />}
            onClick={() => track('call_click')}
          >
            <bdi dir="ltr">{env.phone}</bdi>
          </Button>
        )}
      </div>
      <dl className="mt-6 grid gap-1 border-t border-(--surface-line) pt-4">
        <ContactRow label={c.email}>
          <a
            href={`mailto:${siteInfo.email}`}
            className="inline-flex min-h-11 items-center break-all underline underline-offset-4 hover:decoration-2"
          >
            <bdi>{siteInfo.email}</bdi>
          </a>
        </ContactRow>
        {siteInfo.address && <ContactRow label={c.address}>{siteInfo.address[lang]}</ContactRow>}
      </dl>
      <a href={siteInfo.facebook} {...externalProps(siteInfo.facebook)} className={TEXT_LINK}>
        {c.facebook}
        <NewTabNote />
      </a>
    </div>
  );
}

function ContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-4">
      <dt className="t-small min-w-28 text-(--surface-fg-3)">{label}</dt>
      <dd className="t-body m-0">{children}</dd>
    </div>
  );
}

/** What happens after sending. Order is the information, so the steps are numbered. No times are promised. */
function NextSteps() {
  const { copy, lang } = useLang();
  const n = copy.form.next;
  return (
    <div className="mt-10">
      <h3 className="t-title">{n.title}</h3>
      <ol className="mt-4 grid gap-3">
        {n.steps.map((step, i) => (
          <li key={step} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-(--surface-control) text-sm font-semibold tabular-nums"
            >
              {formatNumber(i + 1, lang)}
            </span>
            <span className="t-body text-(--surface-fg-2)">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RequestFormBody() {
  const { copy, lang } = useLang();
  const f = copy.form;
  const requested = useRequestedCrane();
  const [values, setValues] = useState<RequestValues>(emptyRequest);
  const [errors, setErrors] = useState<RequestErrors>({});
  const [attempts, setAttempts] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [moreOpen, setMoreOpen] = useState(() => MORE_FIELDS.some((key) => emptyRequest()[key] !== ''));
  const lockedUntil = useRef(0);
  const handoffTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(handoffTimer.current), []);
  const [today, setToday] = useState<string | undefined>(undefined);
  const summary = useRef<HTMLDivElement>(null);
  const result = useRef<HTMLDivElement>(null);

  // `min` for the date field. Set after hydration so the prerendered HTML never holds a stale date.
  useEffect(() => {
    setToday(localIsoDate(new Date()));
  }, []);

  // Keep the crane field in step with the crane on the hook (card button, bar chip clear).
  useEffect(() => {
    setValues((v) => {
      if (requested) {
        const option = craneOptionValue(requested);
        return v.crane === option ? v : { ...v, crane: option };
      }
      return craneFromOption(v.crane) ? { ...v, crane: '' } : v;
    });
  }, [requested]);

  // After a failed submit, move focus to the summary so it is read out.
  useEffect(() => {
    if (attempts > 0 && Object.keys(errors).length > 0) summary.current?.focus();
    // Runs once per submit attempt only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts]);

  useEffect(() => {
    if (status === 'sent' || status === 'failed' || status === 'offline') result.current?.focus();
  }, [status]);

  // Capped: every wa.me / mailto URL built from the request carries at most HANDOFF_MESSAGE_MAX characters of free text.
  const message = handoffMessage(values, copy);
  const errorKeys = FORM_ORDER.filter((key) => errors[key]);

  const update = (key: RequestField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next: RequestValues = { ...values, [key]: event.target.value };
    setValues(next);
    if (attempts > 0) setErrors(validateRequest(next, copy, today));
    if (key === 'crane') {
      const crane = craneFromOption(event.target.value);
      if (crane !== getRequestedCrane()) setRequestedCrane(crane);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending' || Date.now() < lockedUntil.current) return;
    const found = validateRequest(values, copy, today);
    setErrors(found);
    setAttempts((n) => n + 1);
    if (MORE_FIELDS.some((key) => found[key])) setMoreOpen(true);
    if (Object.keys(found).length > 0) return;

    if (!env.formEndpoint) {
      // No backend: hand the written-out request to WhatsApp (or mailto in staging).
      track('form_submit', { result: env.whatsapp ? 'whatsapp' : 'mailto' });
      lockedUntil.current = Date.now() + HANDOFF_LOCK_MS;
      setStatus('handoff');
      window.clearTimeout(handoffTimer.current);
      handoffTimer.current = window.setTimeout(() => setStatus((s) => (s === 'handoff' ? 'idle' : s)), HANDOFF_LOCK_MS);
      window.location.href = whatsappHref(message);
      return;
    }

    setStatus('sending');
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(env.formEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestPayload(values, copy)),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      setStatus('sent');
      track('form_submit', { result: 'sent' });
    } catch {
      setStatus(navigator.onLine ? 'failed' : 'offline');
      track('form_submit', { result: 'failed' });
    } finally {
      window.clearTimeout(timer);
    }
  };

  const live = (
    <p role="status" aria-live="polite" data-testid="form-live" className="sr-only">
      {status === 'handoff'
        ? f.handoff
        : status === 'sending'
          ? f.busy
          : status === 'sent'
            ? f.success.title
            : status === 'failed' || status === 'offline'
              ? f.failure.title
              : ''}
    </p>
  );

  if (status === 'sent') {
    return (
      <div>
        {live}
        <div ref={result} tabIndex={-1} data-testid="form-success" className="py-4 outline-none">
          <svg viewBox="0 0 56 56" aria-hidden="true" className="atlas-check size-14">
            <circle className="atlas-check__ring" cx="28" cy="28" r="25" fill="none" strokeWidth="3" />
            <path
              className="atlas-check__tick"
              d="M17 29.5 24.5 37 39.5 20"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="t-title mt-6">{f.success.title}</h3>
          <p className="t-body mt-3">
            <Fill template={f.success.text} vars={{ phone: <bdi dir="ltr">{toAsciiDigits(values.phone).trim()}</bdi> }} />
          </p>
          <p className="t-body mt-6 text-(--surface-fg-2)">{f.success.nudge}</p>
          <Button
            href={whatsappHref(buildFollowUpMessage(values, copy))}
            external
            className="mt-4"
            icon={<WhatsAppIcon className="size-5" />}
            onClick={() => track('whatsapp_click', { location: 'form' })}
          >
            {f.success.button}
          </Button>
        </div>
      </div>
    );
  }

  const whatsappAlt = whatsappHref(message);
  const altExt = externalProps(whatsappAlt);

  return (
    <div>
      {live}
      <form noValidate onSubmit={onSubmit} data-testid="request-form" aria-describedby="request-privacy" className="grid gap-6">
        {attempts > 0 && errorKeys.length > 0 && (
          <div
            ref={summary}
            tabIndex={-1}
            data-testid="form-error-summary"
            className="rounded-lg border border-(--surface-danger) bg-red-50 p-5"
          >
            <p className="font-semibold">{f.errorSummary}</p>
            <ul className="mt-3 grid gap-2">
              {errorKeys.map((key) => (
                <li key={key}>
                  <a
                    href={`#request-${key}`}
                    onClick={(event) => {
                      event.preventDefault();
                      // A field inside the closed disclosure must be rendered before it can take focus.
                      if (MORE_FIELDS.includes(key)) flushSync(() => setMoreOpen(true));
                      document.getElementById(`request-${key}`)?.focus();
                    }}
                    className="underline underline-offset-4 hover:decoration-2"
                  >
                    {errors[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(status === 'failed' || status === 'offline') && (
          <div
            ref={result}
            tabIndex={-1}
            data-testid="form-failure"
            className="rounded-lg border border-(--surface-danger) bg-red-50 p-5"
          >
            <p className="font-semibold">{f.failure.title}</p>
            <p className="t-body mt-2">{status === 'offline' ? f.failure.offline : f.failure.text}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="submit" variant="secondary" size="md">
                {f.failure.retry}
              </Button>
              <Button
                href={whatsappAlt}
                external
                size="md"
                icon={<WhatsAppIcon className="size-5" />}
                onClick={() => track('whatsapp_click', { location: 'form' })}
              >
                {f.failure.whatsapp}
              </Button>
              <Button href={mailtoHref(emailSubject(values, copy), message)} variant="ghost-light" size="md">
                {f.failure.email}
              </Button>
            </div>
          </div>
        )}

        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <Field name="phone" required label={f.fields.phone.label} hint={f.fields.phone.hint} error={errors.phone}>
            {(a11y) => (
              // dir="ltr" keeps a leading "+" before the digits in an RTL page.
              <input
                {...a11y}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                data-testid="form-phone"
                value={values.phone}
                onChange={update('phone')}
                className={`${controlClass()} tabular-nums`}
              />
            )}
          </Field>
          <Field name="weight" required unit={f.fields.weight.unit} label={f.fields.weight.label} error={errors.weight}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                data-testid="form-weight"
                value={values.weight}
                onChange={update('weight')}
                className={`${controlClass({ unit: true })} tabular-nums`}
              />
            )}
          </Field>
          <Field name="crane" label={f.fields.crane.label} className="sm:col-span-2">
            {(a11y) => (
              <>
                {requested && (
                  <Chip data-testid="form-hook-chip" className="mb-2 self-start bg-ink text-white">
                    <HookIcon className="size-4" />
                    <span>
                      {copy.bar.onHook} <bdi>{craneOrServiceLabel(values.crane, copy)}</bdi>
                    </span>
                  </Chip>
                )}
                <select {...a11y} value={values.crane} onChange={update('crane')} className={controlClass()}>
                  <option value="">{f.fields.crane.unsure}</option>
                  <optgroup label={f.fields.crane.servicesGroup}>
                    {copy.services.items.map((service) => (
                      <option key={service.id} value={serviceOptionValue(service.id)}>
                        {service.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={f.fields.crane.cranesGroup}>
                    {visibleCranes.map((crane) => (
                      <option key={crane.id} value={craneOptionValue(crane.id)}>
                        {`${crane.make} ${crane.model}`}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </>
            )}
          </Field>
          <Field name="site" label={f.fields.site.label} error={errors.site}>
            {(a11y) => (
              <input {...a11y} type="text" dir="auto" value={values.site} onChange={update('site')} className={controlClass()} />
            )}
          </Field>
          <Field name="name" label={f.fields.name.label} error={errors.name}>
            {(a11y) => (
              <input
                {...a11y}
                type="text"
                autoComplete="name"
                dir="auto"
                value={values.name}
                onChange={update('name')}
                className={controlClass()}
              />
            )}
          </Field>
        </div>

        <details
          open={moreOpen}
          onToggle={(event) => setMoreOpen(event.currentTarget.open)}
          data-testid="form-more"
          className="group"
        >
          <summary
            data-testid="form-more-toggle"
            className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-semibold underline-offset-4 hover:underline [&::-webkit-details-marker]:hidden"
          >
            <span
              aria-hidden="true"
              className="grid size-6 place-items-center rounded-full border border-(--surface-control) text-base leading-none transition-transform group-open:rotate-45"
            >
              +
            </span>
            {f.more}
          </summary>
          <div className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <Field name="company" label={f.fields.company.label} error={errors.company} className="sm:col-span-2">
              {(a11y) => (
                <input
                  {...a11y}
                  type="text"
                  autoComplete="organization"
                  dir="auto"
                  value={values.company}
                  onChange={update('company')}
                  className={controlClass()}
                />
              )}
            </Field>
            <Field name="radius" unit={f.fields.radius.unit} label={f.fields.radius.label} error={errors.radius}>
              {(a11y) => (
                <input
                  {...a11y}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={values.radius}
                  onChange={update('radius')}
                  className={`${controlClass({ unit: true })} tabular-nums`}
                />
              )}
            </Field>
            <Field name="height" unit={f.fields.height.unit} label={f.fields.height.label} error={errors.height}>
              {(a11y) => (
                <input
                  {...a11y}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={values.height}
                  onChange={update('height')}
                  className={`${controlClass({ unit: true })} tabular-nums`}
                />
              )}
            </Field>
            <Field name="start" label={f.fields.start.label} error={errors.start}>
              {(a11y) => (
                <input
                  {...a11y}
                  type="date"
                  min={today}
                  value={values.start}
                  onChange={update('start')}
                  className={`${controlClass()} tabular-nums`}
                />
              )}
            </Field>
            <Field name="duration" label={f.fields.duration.label}>
              {(a11y) => (
                <select {...a11y} value={values.duration} onChange={update('duration')} className={controlClass()}>
                  <option value="">{f.fields.duration.unsure}</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {f.fields.duration.options[d]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <div className="sm:col-span-2">
              <Field name="message" label={f.fields.message.label} error={errors.message}>
                {(a11y) => (
                  <textarea {...a11y} rows={4} dir="auto" value={values.message} onChange={update('message')} className={controlClass()} />
                )}
              </Field>
              <p className="t-small mt-1 text-end tabular-nums text-(--surface-fg-3)">
                <Fill
                  template={f.fields.message.counter}
                  vars={{ n: formatNumber(values.message.length, lang), max: formatNumber(LIMITS.message, lang) }}
                />
              </p>
            </div>
          </div>
        </details>

        <div className="flex flex-col items-start gap-5">
          <p id="request-privacy" className="t-small max-w-[36rem] [&:lang(ar)]:max-w-[38rem] text-(--surface-fg-3)">
            {f.privacy}
          </p>
          <Button type="submit" size="lg" magnetic loading={status === 'sending'} loadingLabel={f.busy} data-testid="form-submit">
            {f.submit}
          </Button>
          <a href={whatsappAlt} {...altExt} onClick={() => track('whatsapp_click', { location: 'form' })} className={TEXT_LINK}>
            {f.whatsappAlt}
            {altExt.target && <NewTabNote />}
          </a>
        </div>
      </form>
    </div>
  );
}

interface FieldA11y {
  id: string;
  name: RequestField;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

function Field({
  name,
  label,
  hint,
  required = false,
  error,
  unit,
  className = '',
  children,
}: {
  name: RequestField;
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  unit?: string;
  className?: string;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const { copy } = useLang();
  const id = `request-${name}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = `${id}-error`;
  const a11y: FieldA11y = {
    id,
    name,
    ...(error || hintId ? { 'aria-describedby': error ? (hintId ? `${errorId} ${hintId}` : errorId) : hintId } : {}),
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
  };
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="t-body font-semibold">
          {label}
        </label>
        {/* Only required fields are tagged: the intro says the rest is optional, and nine repeated "Optional" tags were noise. */}
        {required && <span className="t-caption text-(--surface-fg-3)">{copy.form.required}</span>}
      </div>
      <div className="relative mt-2 flex flex-col">
        {children(a11y)}
        {unit && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 end-4 flex items-center font-medium text-(--surface-fg-3)"
          >
            {unit}
          </span>
        )}
      </div>
      {hint && (
        <p id={hintId} className="t-small mt-2 text-(--surface-fg-2)">
          {hint}
        </p>
      )}
      {/* Danger red on white is 6.3:1; the border and a bold message both mark the field. */}
      <p id={errorId} aria-live="polite" className={`t-small font-semibold text-(--surface-danger) ${error ? 'mt-2' : ''}`}>
        {error ?? ''}
      </p>
    </div>
  );
}
