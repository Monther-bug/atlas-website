import { NewTabNote, externalProps } from '@/components/Button';
import { FacebookIcon, TikTokIcon } from '@/components/Icons';
import { siteInfo } from '@/content';

const TONE = {
  light: 'bg-(--surface-wash) text-(--surface-accent) hover:bg-(--surface-wash-2)',
  dark: 'bg-white/10 text-white hover:bg-white/20',
} as const;

/**
 * Facebook and TikTok as round 44 px icon links (client, 11 Nov 2026: icons only, no text). Each keeps its name for
 * screen readers (sr-only), plus the new-tab note. Tones match IconButton: `light` on the light surfaces, `dark` on black.
 */
export function SocialLinks({
  labels,
  tone = 'light',
  className = '',
}: {
  labels: { facebook: string; tiktok: string };
  tone?: keyof typeof TONE;
  className?: string;
}) {
  const links = [
    { href: siteInfo.facebook, label: labels.facebook, Icon: FacebookIcon },
    { href: siteInfo.tiktok, label: labels.tiktok, Icon: TikTokIcon },
  ];
  return (
    <ul className={`m-0 flex list-none gap-2 p-0 ${className}`}>
      {links.map(({ href, label, Icon }) => (
        <li key={href}>
          <a
            href={href}
            {...externalProps(href)}
            data-social=""
            className={`inline-flex size-11 items-center justify-center rounded-full transition-[background-color,transform] duration-(--dur-state) ease-ui active:scale-95 ${TONE[tone]}`}
          >
            <Icon className="size-5" />
            <span className="sr-only">{label}</span>
            <NewTabNote />
          </a>
        </li>
      ))}
    </ul>
  );
}
