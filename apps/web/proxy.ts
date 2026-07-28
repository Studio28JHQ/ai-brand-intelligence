import { NextRequest, NextResponse } from 'next/server';
import { isSupportedLocale, resolveLocale } from '@ai-visibility/i18n';

export const LOCALE_COOKIE = 'NEXT_LOCALE';
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

// Resolves and persists the active locale for every request (F10-S05A). No URL rewriting/locale
// prefixing — the ticket only requires locale-prefixed URLs "if the existing architecture makes
// that clearly preferable," and it does not here, so this stays a cookie-only concern.
//
// The saved-user-preference step of the resolution order isn't consulted here: reading it would
// mean a DB lookup on every request. Real persistence exists now (`F10-S05B`, `UserMetadata.locale`),
// but it's synced into this same cookie at the two moments the value can actually change for an
// authenticated user — login (`auth-actions.ts#loginUser`) and an explicit Settings change
// (`auth-actions.ts#updateLocalePreference`) — rather than read from the database on every request.
export function proxy(request: NextRequest): NextResponse {
  const response = NextResponse.next();

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isSupportedLocale(cookieLocale)) {
    return response;
  }

  const locale = resolveLocale({
    userPreference: null,
    acceptLanguageHeader: request.headers.get('accept-language'),
  });

  response.cookies.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    sameSite: 'lax',
  });

  return response;
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
