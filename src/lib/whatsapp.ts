import { siteInfo } from '@/content/site';
import { env } from '@/env';

/** Replaces each {key} with vars[key]. Unknown keys stay visible so a gap shows in staging. */
export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? (vars[key] ?? match) : match,
  );
}

export function mailtoHref(subject: string, body: string): string {
  return `mailto:${siteInfo.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * wa.me link with the message. Without VITE_WHATSAPP (staging) it opens an
 * email to Atlas instead, with the message's first line as the subject.
 */
export function whatsappHref(message: string): string {
  const number = env.whatsapp?.replace(/\D/g, '');
  if (number) return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  return mailtoHref((message.split(/\r?\n/)[0] ?? '').trim(), message);
}

export function telHref(): string | null {
  const raw = env.phone?.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  if (!digits) return null;
  return `tel:${raw.startsWith('+') ? '+' : ''}${digits}`;
}
