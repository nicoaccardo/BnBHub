/// <reference types="jasmine" />

import { getSafeInternalReturnUrl } from './return-url';

describe('getSafeInternalReturnUrl', () => {
  it('keeps internal application URLs', () => {
    expect(getSafeInternalReturnUrl('/prenota?camera=2#riepilogo', '/home'))
      .toBe('/prenota?camera=2#riepilogo');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(getSafeInternalReturnUrl('https://example.com', '/home')).toBe('/home');
    expect(getSafeInternalReturnUrl('//example.com', '/home')).toBe('/home');
  });

  it('rejects encoded protocol-relative and malformed URLs', () => {
    expect(getSafeInternalReturnUrl('/%2Fexample.com', '/home')).toBe('/home');
    expect(getSafeInternalReturnUrl('/%E0%A4%A', '/home')).toBe('/home');
  });
});
