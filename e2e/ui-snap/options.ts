import { parseArgs } from 'node:util';

export const WIDTHS = [375, 768, 1280, 1440] as const;
const STATES = ['hover', 'focus', 'menu'] as const;

export type SnapState = (typeof STATES)[number];

export interface SnapOptions {
  route: string;
  url: string;
  states: SnapState[];
  selector: string | undefined;
}

const DEFAULT_BASE = 'http://localhost:3000';

function isState(value: string): value is SnapState {
  return (STATES as readonly string[]).includes(value);
}

/** `pnpm ui:snap <rota> [--states hover,focus,menu] [--selector <css>] [--base <url>]` argümanlarını ayrıştırır. */
export function parseSnapArgs(argv: readonly string[]): SnapOptions {
  const { values, positionals } = parseArgs({
    args: [...argv],
    allowPositionals: true,
    options: {
      states: { type: 'string' },
      selector: { type: 'string' },
      base: { type: 'string', default: DEFAULT_BASE },
    },
  });

  const route = positionals[0];
  if (!route?.startsWith('/')) {
    throw new Error(
      'Rota "/" ile başlamalı. Örnek: pnpm ui:snap /urun/ornek-takim --states hover,focus',
    );
  }

  const states = (values.states ?? '')
    .split(',')
    .map((state) => state.trim())
    .filter((state) => state !== '');
  const unknown = states.filter((state) => !isState(state));
  if (unknown.length > 0) {
    throw new Error(`Bilinmeyen durum: ${unknown.join(', ')}. Geçerli: ${STATES.join(', ')}`);
  }

  return {
    route,
    url: new URL(route, values.base).toString(),
    states: states.filter(isState),
    selector: values.selector,
  };
}

/** Rotayı klasör adına çevirir: `/` → `index`, `/urun/ada-takimi?renk=ceviz` → `urun-ada-takimi-renk-ceviz`. */
export function routeSlug(route: string): string {
  const slug = route
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug === '' ? 'index' : slug;
}
