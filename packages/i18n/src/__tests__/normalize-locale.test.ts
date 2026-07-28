import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocale } from '../normalize-locale';

test('normalizeLocale: exact supported tags pass through', () => {
  assert.equal(normalizeLocale('en'), 'en');
  assert.equal(normalizeLocale('es'), 'es');
  assert.equal(normalizeLocale('pt-BR'), 'pt-BR');
});

test('normalizeLocale: Spanish regional variants collapse to es', () => {
  assert.equal(normalizeLocale('es-MX'), 'es');
  assert.equal(normalizeLocale('es-CO'), 'es');
  assert.equal(normalizeLocale('es-ES'), 'es');
});

test('normalizeLocale: Portuguese variants (including pt-PT) map to pt-BR', () => {
  assert.equal(normalizeLocale('pt-BR'), 'pt-BR');
  assert.equal(normalizeLocale('pt-PT'), 'pt-BR');
  assert.equal(normalizeLocale('pt'), 'pt-BR');
});

test('normalizeLocale: English regional variants collapse to en', () => {
  assert.equal(normalizeLocale('en-US'), 'en');
  assert.equal(normalizeLocale('en-GB'), 'en');
});

test('normalizeLocale: unsupported languages fall back to en', () => {
  assert.equal(normalizeLocale('fr'), 'en');
  assert.equal(normalizeLocale('fr-FR'), 'en');
  assert.equal(normalizeLocale('de-DE'), 'en');
  assert.equal(normalizeLocale('ja'), 'en');
});

test('normalizeLocale: empty, whitespace, and malformed tags fall back to en', () => {
  assert.equal(normalizeLocale(''), 'en');
  assert.equal(normalizeLocale('   '), 'en');
  assert.equal(normalizeLocale('!!!'), 'en');
});

test('normalizeLocale: is case-insensitive', () => {
  assert.equal(normalizeLocale('EN-US'), 'en');
  assert.equal(normalizeLocale('Es-mx'), 'es');
  assert.equal(normalizeLocale('PT-br'), 'pt-BR');
});
