import { MessageDomain, SupportedLocale } from './locales';

import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enAuth from '../locales/en/auth.json';
import enDashboard from '../locales/en/dashboard.json';
import enProjects from '../locales/en/projects.json';
import enAudits from '../locales/en/audits.json';
import enPages from '../locales/en/pages.json';
import enFindings from '../locales/en/findings.json';
import enOptimization from '../locales/en/optimization.json';
import enReports from '../locales/en/reports.json';
import enSettings from '../locales/en/settings.json';
import enErrors from '../locales/en/errors.json';

import esCommon from '../locales/es/common.json';
import esNavigation from '../locales/es/navigation.json';
import esAuth from '../locales/es/auth.json';
import esDashboard from '../locales/es/dashboard.json';
import esProjects from '../locales/es/projects.json';
import esAudits from '../locales/es/audits.json';
import esPages from '../locales/es/pages.json';
import esFindings from '../locales/es/findings.json';
import esOptimization from '../locales/es/optimization.json';
import esReports from '../locales/es/reports.json';
import esSettings from '../locales/es/settings.json';
import esErrors from '../locales/es/errors.json';

import ptBrCommon from '../locales/pt-BR/common.json';
import ptBrNavigation from '../locales/pt-BR/navigation.json';
import ptBrAuth from '../locales/pt-BR/auth.json';
import ptBrDashboard from '../locales/pt-BR/dashboard.json';
import ptBrProjects from '../locales/pt-BR/projects.json';
import ptBrAudits from '../locales/pt-BR/audits.json';
import ptBrPages from '../locales/pt-BR/pages.json';
import ptBrFindings from '../locales/pt-BR/findings.json';
import ptBrOptimization from '../locales/pt-BR/optimization.json';
import ptBrReports from '../locales/pt-BR/reports.json';
import ptBrSettings from '../locales/pt-BR/settings.json';
import ptBrErrors from '../locales/pt-BR/errors.json';

// Arbitrary nesting depth: a domain file can group related keys under a sub-object
// (e.g. `{ "buttons": { "save": "Save" } }`, looked up as `t('buttons.save')`).
export type MessageValue = string | { one: string; other: string };
export interface Messages {
  [key: string]: MessageValue | Messages;
}

// Statically imported rather than read from disk at runtime with `node:fs` (F10-S05A). A prior
// version resolved `locales/<locale>/<domain>.json` via `join(__dirname, '..', 'locales', ...)`;
// that broke under Next.js/Turbopack's server bundling, which rewrites `__dirname` to a
// build-time-only placeholder that isn't a real path at runtime — every lookup silently failed
// and fell through to `{}`. Static imports are real entries in the module graph, so every bundler
// (Turbopack, webpack, plain `tsc`+Node) traces and inlines the JSON content correctly, with no
// runtime path resolution involved at all.
const MESSAGES: Record<SupportedLocale, Record<MessageDomain, Messages>> = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    dashboard: enDashboard,
    projects: enProjects,
    audits: enAudits,
    pages: enPages,
    findings: enFindings,
    optimization: enOptimization,
    reports: enReports,
    settings: enSettings,
    errors: enErrors,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    auth: esAuth,
    dashboard: esDashboard,
    projects: esProjects,
    audits: esAudits,
    pages: esPages,
    findings: esFindings,
    optimization: esOptimization,
    reports: esReports,
    settings: esSettings,
    errors: esErrors,
  },
  'pt-BR': {
    common: ptBrCommon,
    navigation: ptBrNavigation,
    auth: ptBrAuth,
    dashboard: ptBrDashboard,
    projects: ptBrProjects,
    audits: ptBrAudits,
    pages: ptBrPages,
    findings: ptBrFindings,
    optimization: ptBrOptimization,
    reports: ptBrReports,
    settings: ptBrSettings,
    errors: ptBrErrors,
  },
};

// A domain missing from this table for a given locale returns an empty bundle rather than
// throwing — the translator's per-key English fallback takes over from there, which is the safe,
// honest behavior the fallback requirement asks for.
export function loadMessages(locale: SupportedLocale, domain: MessageDomain): Messages {
  return MESSAGES[locale]?.[domain] ?? {};
}
