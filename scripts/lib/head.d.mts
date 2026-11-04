export interface ParsedHead {
  lang: string | null;
  dir: string | null;
  title: string;
  meta: Record<string, string>;
  canonical: string | null;
  alternates: Record<string, string>;
  icons: string[];
  jsonLd: unknown[];
  jsonLdErrors: string[];
}
export declare function decodeEntities(s: string): string;
export declare function parseAttrs(tag: string): Record<string, string>;
export declare function parseHead(html: string): ParsedHead;
