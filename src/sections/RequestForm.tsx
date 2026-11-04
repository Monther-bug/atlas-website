import { useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { Button, NewTabNote, externalProps } from '@/components/Button';
import { Fill } from '@/components/Fill';
import { WhatsAppIcon } from '@/components/Icons';
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
  REQUEST_FIELDS,
  buildFollowUpMessage,
  handoffMessage,
  craneFromOption,
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

type Status = 'idle' | 'handoff' | 'sending' | 'sent' | 'failed' | 'offline';
const TIMEOUT_MS = 10_000;
const HANDOFF_LOCK_MS = 3000;

const CONTROL =
  'block w-full rounded-none border border-white/40 bg-navy-950 ps-4 text-base text-white transition-colors hover:border-white/70 focus:border-white aria-invalid:border-2 aria-invalid:border-red-bright';
function controlClass({ unit = false, multiline = false }: { unit?: boolean; multiline?: boolean } = {}): string {
  return `${CONTROL} ${unit ? 'pe-14' : 'pe-4'} ${multiline ? 'min-h-36 py-3' : 'h-13'}`;
}
const TEXT_LINK = 'inline-flex min-h-11 items-center font-semibold underline hover:decoration-2';

export function RequestForm() {
  const { copy } = useLang();
  const f = copy.form;
  return (
    <section id="request" data-ground="dark" aria-labelledby="request-title" className="section-y bg-navy-950 text-white">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 id="request-title" className="t-h2 text-balance">
            {f.title}
          </h2>
          <p className="t-lead measure mt-5">{f.lead}</p>
          <p className="t-body measure mt-4 text-steel">{f.intro}</p>
          <ContactPanel />
        </div>
        <div className="lg:col-span-7">
          <RequestFormBody />
        </div>
      </div>
    </section>
  );
}

function ContactPanel() {
  const { copy, lang } = useLang();
  const c = copy.form.contact;
  const tel = telHref();
  const whatsapp = env.whatsapp ? whatsappHref(copy.whatsapp.general) : null;
  return (
    <div className="mt-12 border-t border-line-dark pt-8">
      <dl className="grid gap-5">
        <ContactRow label={c.email}>
          <a href={`mailto:${siteInfo.email}`} className="inline-flex min-h-11 items-center break-all underline hover:decoration-2">
            <bdi>{siteInfo.email}</bdi>
          </a>
        </ContactRow>
        {tel && env.phone && (
          <ContactRow label={c.phone}>
            <a href={tel} onClick={() => track('call_click')} className="underline hover:decoration-2">
              <bdi dir="ltr">{env.phone}</bdi>
            </a>
          </ContactRow>
        )}
        {whatsapp && env.whatsapp && (
          <ContactRow label={c.whatsapp}>
            <a
              href={whatsapp}
              {...externalProps(whatsapp)}
              onClick={() => track('whatsapp_click', { location: 'form' })}
              className="underline hover:decoration-2"
            >
              <bdi dir="ltr">+{env.whatsapp.replace(/\D/g, '')}</bdi>
              <NewTabNote />
            </a>
          </ContactRow>
        )}
        {siteInfo.address && <ContactRow label={c.address}>{siteInfo.address[lang]}</ContactRow>}
      </dl>
      <a href={siteInfo.facebook} {...externalProps(siteInfo.facebook)} className={`${TEXT_LINK} mt-6`}>
        {c.facebook}
        <NewTabNote />
      </a>
    </div>
  );
}

function ContactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="t-label text-steel">{label}</dt>
      <dd className="t-body mt-1">{children}</dd>
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
  const errorKeys = REQUEST_FIELDS.filter((key) => errors[key]);

  const update = (key: RequestField) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const next: RequestValues = { ...values, [key]: event.target.value };
    setValues(next);
    if (attempts > 0) setErrors(validateRequest(next, lang, today));
    if (key === 'crane') {
      const crane = craneFromOption(event.target.value);
      if (crane !== getRequestedCrane()) setRequestedCrane(crane);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === 'sending' || Date.now() < lockedUntil.current) return;
    const found = validateRequest(values, lang, today);
    setErrors(found);
    setAttempts((n) => n + 1);
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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
        <div ref={result} tabIndex={-1} data-testid="form-success" className="border border-line-dark p-8 md:p-10">
          <h3 className="t-h3">{f.success.title}</h3>
          <p className="t-body mt-3">
            <Fill template={f.success.text} vars={{ phone: <bdi dir="ltr">{toAsciiDigits(values.phone).trim()}</bdi> }} />
          </p>
          <p className="t-body mt-6 text-steel">{f.success.nudge}</p>
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
      <form noValidate onSubmit={onSubmit} data-testid="request-form" aria-describedby="request-privacy" className="grid gap-12">
        {attempts > 0 && errorKeys.length > 0 && (
          <div ref={summary} tabIndex={-1} data-testid="form-error-summary" className="border border-red-bright p-5">
            <p className="font-semibold">{f.errorSummary}</p>
            <ul className="mt-3 grid gap-2">
              {errorKeys.map((key) => (
                <li key={key}>
                  <a
                    href={`#request-${key}`}
                    onClick={(event) => {
                      event.preventDefault();
                      document.getElementById(`request-${key}`)?.focus();
                    }}
                    className="underline hover:decoration-2"
                  >
                    {errors[key]}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {(status === 'failed' || status === 'offline') && (
          <div ref={result} tabIndex={-1} data-testid="form-failure" className="border border-red-bright p-5">
            <p className="font-semibold">{f.failure.title}</p>
            <p className="t-body mt-2">{status === 'offline' ? f.failure.offline : f.failure.text}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="submit" variant="outline-on-dark" size="md">
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
              <Button href={mailtoHref(emailSubject(values, copy), message)} variant="outline-on-dark" size="md">
                {f.failure.email}
              </Button>
            </div>
          </div>
        )}

        <fieldset>
          <legend className="t-h3">{f.groups.details}</legend>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field name="name" label={f.fields.name.label} hint={f.fields.name.hint} error={errors.name}>
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
            <Field name="company" label={f.fields.company.label} hint={f.fields.company.hint} error={errors.company}>
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
            <Field
              name="phone"
              required
              label={f.fields.phone.label}
              hint={f.fields.phone.hint}
              error={errors.phone}
              className="sm:col-span-2"
            >
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
                  className={`${controlClass()} tabular-nums rtl:text-right`}
                />
              )}
            </Field>
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-h3">{f.groups.lift}</legend>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <Field name="crane" label={f.fields.crane.label} hint={f.fields.crane.hint} className="sm:col-span-3">
              {(a11y) => (
                <select {...a11y} value={values.crane} onChange={update('crane')} className={`${controlClass()} [color-scheme:dark]`}>
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
              )}
            </Field>
            <Field
              name="weight"
              required
              unit={f.fields.weight.unit}
              label={f.fields.weight.label}
              hint={f.fields.weight.hint}
              error={errors.weight}
            >
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
            <Field
              name="radius"
              unit={f.fields.radius.unit}
              label={f.fields.radius.label}
              hint={f.fields.radius.hint}
              error={errors.radius}
            >
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
            <Field
              name="height"
              unit={f.fields.height.unit}
              label={f.fields.height.label}
              hint={f.fields.height.hint}
              error={errors.height}
            >
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
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-h3">{f.groups.site}</legend>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Field name="site" label={f.fields.site.label} hint={f.fields.site.hint} error={errors.site} className="sm:col-span-2">
              {(a11y) => (
                <input {...a11y} type="text" dir="auto" value={values.site} onChange={update('site')} className={controlClass()} />
              )}
            </Field>
            <Field name="start" label={f.fields.start.label} hint={f.fields.start.hint} error={errors.start}>
              {(a11y) => (
                <input
                  {...a11y}
                  type="date"
                  min={today}
                  value={values.start}
                  onChange={update('start')}
                  className={`${controlClass()} tabular-nums [color-scheme:dark]`}
                />
              )}
            </Field>
            <Field name="duration" label={f.fields.duration.label} hint={f.fields.duration.hint}>
              {(a11y) => (
                <select {...a11y} value={values.duration} onChange={update('duration')} className={`${controlClass()} [color-scheme:dark]`}>
                  <option value="">{f.fields.duration.unsure}</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {f.fields.duration.options[d]}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
        </fieldset>

        <div>
          <Field name="message" label={f.fields.message.label} hint={f.fields.message.hint} error={errors.message}>
            {(a11y) => (
              <textarea
                {...a11y}
                rows={5}
                dir="auto"
                value={values.message}
                onChange={update('message')}
                className={controlClass({ multiline: true })}
              />
            )}
          </Field>
          <p className="t-small mt-1 text-end tabular-nums text-steel">
            <Fill
              template={f.fields.message.counter}
              vars={{ n: formatNumber(values.message.length, lang), max: formatNumber(LIMITS.message, lang) }}
            />
          </p>
        </div>

        <div className="flex flex-col items-start gap-5">
          <p id="request-privacy" className="t-small measure text-steel">
            {f.privacy}
          </p>
          <Button type="submit" loading={status === 'sending'} loadingLabel={f.busy} data-testid="form-submit">
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
  'aria-describedby': string;
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
  hint: string;
  required?: boolean;
  error?: string;
  unit?: string;
  className?: string;
  children: (a11y: FieldA11y) => ReactNode;
}) {
  const { copy } = useLang();
  const id = `request-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const a11y: FieldA11y = {
    id,
    name,
    'aria-describedby': error ? `${errorId} ${hintId}` : hintId,
    ...(error ? { 'aria-invalid': true as const } : {}),
    ...(required ? { 'aria-required': true as const } : {}),
  };
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-semibold">
          {label}
        </label>
        <span className="t-small text-steel">{required ? copy.form.required : copy.form.optional}</span>
      </div>
      <p id={hintId} className="t-small mt-1 text-steel">
        {hint}
      </p>
      <div className="relative mt-2">
        {children(a11y)}
        {unit && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 end-4 flex items-center text-steel">
            {unit}
          </span>
        )}
      </div>
      {/* White text, not red: red on navy fails contrast (spec §6). The red-bright border marks the field. */}
      <p id={errorId} aria-live="polite" className="t-small mt-2 font-semibold text-white">
        {error ?? ''}
      </p>
    </div>
  );
}
