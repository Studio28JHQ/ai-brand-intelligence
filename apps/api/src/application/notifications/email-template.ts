const BRAND_COLOR = '#4f46e5';
const BRAND_NAME = 'AI Visibility Auditor';
const FOOTER_TEXT = `This is an automated message from ${BRAND_NAME}. If you didn't expect this email, you can safely ignore it.`;

export interface EmailCta {
  label: string;
  href: string;
}

export interface EmailContent {
  heading: string;
  bodyLines: string[];
  cta?: EmailCta;
}

export interface RenderedEmail {
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * The one shared layout for every transactional email this platform sends (OTP for email
 * verification, OTP for password reset, and any future notification) — a single function so
 * "same visual identity" (`F9-S02-HF02`) is a structural guarantee, not a convention each new
 * email has to remember to follow.
 */
export function renderEmailTemplate({ heading, bodyLines, cta }: EmailContent): RenderedEmail {
  const paragraphsHtml = bodyLines.map((line) => `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">${escapeHtml(line)}</p>`).join('');

  const ctaHtml = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
         <tr>
           <td style="border-radius:8px;background:${BRAND_COLOR};">
             <a href="${escapeHtml(cta.href)}" style="display:inline-block;padding:12px 28px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">${escapeHtml(cta.label)}</a>
           </td>
         </tr>
       </table>`
    : '';

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:32px 16px;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="background:${BRAND_COLOR};padding:24px 32px;">
                <span style="color:#ffffff;font-size:18px;font-weight:600;">${BRAND_NAME}</span>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h1 style="margin:0 0 16px;color:#111827;font-size:20px;">${escapeHtml(heading)}</h1>
                ${paragraphsHtml}
                ${ctaHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;">
                <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.5;">${escapeHtml(FOOTER_TEXT)}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [heading, '', ...bodyLines, ...(cta ? ['', `${cta.label}: ${cta.href}`] : []), '', FOOTER_TEXT].join('\n');

  return { html, text };
}
