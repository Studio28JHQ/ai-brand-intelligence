import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseAcceptLanguage, detectBrowserLocale, resolveLocale } from '../resolve-locale';

test('parseAcceptLanguage: orders tags by quality value, descending', () => {
  assert.deepEqual(parseAcceptLanguage('fr-FR;q=0.5, en-US;q=0.9, es;q=0.8'), ['en-US', 'es', 'fr-FR']);
});

test('parseAcceptLanguage: tags without an explicit q= default to quality 1', () => {
  assert.deepEqual(parseAcceptLanguage('es;q=0.5, en'), ['en', 'es']);
});

test('parseAcceptLanguage: ignores the wildcard and empty segments', () => {
  assert.deepEqual(parseAcceptLanguage('en-US, *;q=0.1, , es;q=0.9'), ['en-US', 'es']);
});

test('parseAcceptLanguage: null/undefined/empty header returns no tags', () => {
  assert.deepEqual(parseAcceptLanguage(null), []);
  assert.deepEqual(parseAcceptLanguage(undefined), []);
  assert.deepEqual(parseAcceptLanguage(''), []);
});

test('detectBrowserLocale: picks the highest-priority supported language', () => {
  assert.equal(detectBrowserLocale('en-US,es;q=0.8'), 'en');
  assert.equal(detectBrowserLocale('pt-BR,en;q=0.5'), 'pt-BR');
});

test('detectBrowserLocale: a lower-priority supported language beats a higher-priority unsupported one', () => {
  assert.equal(detectBrowserLocale('fr-FR,es;q=0.5'), 'es');
});

test('detectBrowserLocale: regional variants normalize correctly through detection', () => {
  assert.equal(detectBrowserLocale('es-MX,fr;q=0.5'), 'es');
  assert.equal(detectBrowserLocale('pt-PT'), 'pt-BR');
  assert.equal(detectBrowserLocale('en-GB'), 'en');
});

test('detectBrowserLocale: no supported language anywhere in header falls back to en', () => {
  assert.equal(detectBrowserLocale('fr-FR,de-DE;q=0.8'), 'en');
});

test('detectBrowserLocale: missing header falls back to en', () => {
  assert.equal(detectBrowserLocale(null), 'en');
  assert.equal(detectBrowserLocale(undefined), 'en');
});

test('resolveLocale: saved user preference takes priority over browser language', () => {
  assert.equal(resolveLocale({ userPreference: 'pt-BR', acceptLanguageHeader: 'en-US' }), 'pt-BR');
});

test('resolveLocale: falls back to browser language when there is no user preference', () => {
  assert.equal(resolveLocale({ userPreference: null, acceptLanguageHeader: 'es-CO' }), 'es');
  assert.equal(resolveLocale({ acceptLanguageHeader: 'es-CO' }), 'es');
});

test('resolveLocale: falls back to English when neither preference nor browser language resolve', () => {
  assert.equal(resolveLocale({ userPreference: null, acceptLanguageHeader: null }), 'en');
  assert.equal(resolveLocale({}), 'en');
});

test('resolveLocale: an unsupported saved preference still normalizes rather than throwing', () => {
  assert.equal(resolveLocale({ userPreference: 'fr-FR', acceptLanguageHeader: 'es' }), 'en');
});
