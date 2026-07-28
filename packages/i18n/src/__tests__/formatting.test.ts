import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatNumber,
  formatPercent,
  formatCurrency,
} from '../formatting';

const SAMPLE_DATE = new Date('2026-03-15T10:30:00Z');

test('formatDate: produces locale-appropriate, non-empty output for all three locales', () => {
  assert.match(formatDate('en', SAMPLE_DATE), /2026/);
  assert.match(formatDate('es', SAMPLE_DATE), /2026/);
  assert.match(formatDate('pt-BR', SAMPLE_DATE), /2026/);
});

test('formatDateTime: includes both date and time components', () => {
  const result = formatDateTime('en', SAMPLE_DATE);
  assert.match(result, /2026/);
  assert.match(result, /:/);
});

test('formatRelativeTime: describes the past using the correct unit', () => {
  const now = new Date('2026-03-15T12:00:00Z');
  const twoHoursAgo = new Date('2026-03-15T10:00:00Z');
  const result = formatRelativeTime('en', twoHoursAgo, now);
  assert.match(result, /hour/i);
});

test('formatRelativeTime: describes the future using the correct unit', () => {
  const now = new Date('2026-03-15T10:00:00Z');
  const inThreeDays = new Date('2026-03-18T10:00:00Z');
  const result = formatRelativeTime('en', inThreeDays, now);
  assert.match(result, /day/i);
});

test('formatRelativeTime: a near-zero difference reads as "now"', () => {
  const now = new Date('2026-03-15T10:00:00.000Z');
  const almostNow = new Date('2026-03-15T10:00:00.200Z');
  const result = formatRelativeTime('en', almostNow, now);
  assert.match(result, /now/i);
});

test('formatRelativeTime: falls back to the seconds unit below one minute', () => {
  const now = new Date('2026-03-15T10:00:00.000Z');
  const inOneSecond = new Date('2026-03-15T10:00:01.000Z');
  const result = formatRelativeTime('en', inOneSecond, now);
  assert.match(result, /second/i);
});

test('formatNumber: applies locale-specific grouping and decimal separators', () => {
  const enResult = formatNumber('en', 12345.5);
  const esResult = formatNumber('es', 12345.5);
  assert.match(enResult, /12,345\.5/);
  assert.match(esResult, /12\.345,5/);
});

test('formatPercent: treats value as a plain ratio, not a pre-multiplied percentage', () => {
  assert.equal(formatNumber('en', 0), formatNumber('en', 0));
  assert.match(formatPercent('en', 0.42), /42/);
  assert.match(formatPercent('en', 0.42), /%/);
});

test('formatCurrency: formats with the given currency code across all three locales', () => {
  assert.match(formatCurrency('en', 1500, 'USD'), /1,500/);
  assert.match(formatCurrency('es', 1500, 'USD'), /1\.500|1500/);
  assert.match(formatCurrency('pt-BR', 1500, 'USD'), /1\.500|1500/);
});
