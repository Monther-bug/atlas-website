import { Fragment, type ReactNode } from 'react';

/** Like fillTemplate(), but the values may be nodes (for <bdi> around numbers and codes). */
export function Fill({ template, vars }: { template: string; vars: Record<string, ReactNode> }) {
  return (
    <>
      {template.split(/(\{\w+\})/g).map((part, i) => {
        const key = /^\{(\w+)\}$/.exec(part)?.[1];
        const value = key !== undefined && Object.prototype.hasOwnProperty.call(vars, key) ? vars[key] : part;
        return <Fragment key={i}>{value}</Fragment>;
      })}
    </>
  );
}
