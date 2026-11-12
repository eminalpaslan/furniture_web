import { describe, expect, it } from 'vitest';

import { parseSnapArgs, routeSlug } from './options.ts';

describe('parseSnapArgs', () => {
  it('yalnızca rota verilince varsayılan adresi ve boş durum listesini kullanır', () => {
    expect(parseSnapArgs(['/'])).toEqual({
      route: '/',
      url: 'http://localhost:3000/',
      states: [],
      selector: undefined,
    });
  });

  it('durumları, seçiciyi ve farklı taban adresi okur', () => {
    const options = parseSnapArgs([
      '/siparisler',
      '--states',
      'hover, focus,menu',
      '--selector',
      'nav a',
      '--base',
      'http://localhost:3001',
    ]);

    expect(options).toEqual({
      route: '/siparisler',
      url: 'http://localhost:3001/siparisler',
      states: ['hover', 'focus', 'menu'],
      selector: 'nav a',
    });
  });

  it('rota yoksa veya "/" ile başlamıyorsa açıklayıcı hata verir', () => {
    expect(() => parseSnapArgs([])).toThrow('Rota "/" ile başlamalı');
    expect(() => parseSnapArgs(['urun'])).toThrow('Rota "/" ile başlamalı');
  });

  it('bilinmeyen durumu reddeder', () => {
    expect(() => parseSnapArgs(['/', '--states', 'hover,tikla'])).toThrow(
      'Bilinmeyen durum: tikla',
    );
  });
});

describe('routeSlug', () => {
  it.each([
    ['/', 'index'],
    ['/urun/ada-orta-sehpa-takimi', 'urun-ada-orta-sehpa-takimi'],
    ['/kategori/Yatak-Odasi?renk=ceviz', 'kategori-yatak-odasi-renk-ceviz'],
    ['/dev/ui/', 'dev-ui'],
  ])('%s → %s', (route, slug) => {
    expect(routeSlug(route)).toBe(slug);
  });
});
