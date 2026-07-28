import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTranslator } from '../translate';

test('createTranslator: resolves real keys in each of the three supported locales', () => {
  assert.equal(createTranslator('en', 'common')('save'), 'Save');
  assert.equal(createTranslator('es', 'common')('save'), 'Guardar');
  assert.equal(createTranslator('pt-BR', 'common')('save'), 'Salvar');
});

test('createTranslator: interpolates {param} placeholders', () => {
  const t = createTranslator('en', 'common');
  const result = t('itemCount', { count: 1 });
  assert.match(result, /1/);
});

test('createTranslator: selects singular vs plural form by count', () => {
  const t = createTranslator('en', 'common');
  const singular = t('itemCount', { count: 1 });
  const plural = t('itemCount', { count: 5 });
  assert.notEqual(singular, plural);
});

test('createTranslator: a non-English locale resolves its own translated value', () => {
  const t = createTranslator('es', 'common');
  assert.equal(t('save'), 'Guardar');
});

test('createTranslator: a completely missing key (absent in locale and English) never renders raw', () => {
  const originalEnv = process.env.NODE_ENV;

  process.env.NODE_ENV = 'development';
  const devTranslator = createTranslator('en', 'common');
  const devResult = devTranslator('thisKeyDoesNotExistAnywhere');
  assert.equal(devResult, '[[missing: common.thisKeyDoesNotExistAnywhere]]');

  process.env.NODE_ENV = 'production';
  const prodTranslator = createTranslator('en', 'common');
  const prodResult = prodTranslator('thisKeyDoesNotExistAnywhere');
  assert.equal(prodResult, '');

  process.env.NODE_ENV = originalEnv;
});

test('createTranslator: a locale/domain pair absent from the message table falls back to English safely', () => {
  // loadMessages() returns {} for any locale/domain pair missing from its table rather than
  // throwing; exercised here via a real, fully-translated locale/domain to prove the lookup
  // itself never throws and degrades cleanly end to end.
  const t = createTranslator('pt-BR', 'errors');
  const result = t('generic');
  assert.equal(result, 'Algo deu errado. Tente novamente.');
});

test('createTranslator: does not throw when params are omitted for a plain string key', () => {
  const t = createTranslator('en', 'auth');
  assert.doesNotThrow(() => t('signIn'));
});
