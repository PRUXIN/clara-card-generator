module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'light';
  const headline = req.query.headline || 'Your phones ring at 9pm. Clara answers.';
  const subheadline = req.query.subheadline || 'Never miss a new client enquiry.';
  const painstat = req.query.painstat || '62% of clients switch firms due to poor communication';
  const cta = req.query.cta || 'Book a Demo';

  const industryConfig = {
    'accountants': { file: 'Accountants.png', accent: '#C9A84C', label: 'AI FOR ACCOUNTANCY FIRMS', ctaColor: '#C9A84C', ctaTextColor: '#0A0508' },
    'legal':       { file: 'Legal _ Solicitors.png', accent: '#4573CD', label: 'AI FOR LEGAL PRACTICES', ctaColor: '#4573CD', ctaTextColor: '#FFFFFF' },
    'realestate':  { file: 'Real Estate.png', accent: '#E07B30', label: 'AI FOR ESTATE AGENTS', ctaColor: '#E07B30', ctaTextColor: '#FFFFFF' },
    'restaurants': { file: 'Restaurants _ Hospitality.png', accent: '#038D80', label: 'AI FOR HOSPITALITY', ctaColor: '#038D80', ctaTextColor: '#FFFFFF' }
  };

  const config = industryConfig[industry.toLowerCase()] || industryConfig['accountants'];
  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0A0508';
  const subColor = isDark ? '#AAAACC' : '#444444';
  const urlColor = isDark ? '#8899BB' : '#132F67';
  const accent = config.accent;
  const baseUrl = 'https://raw.githubusercontent.com/PRUXIN/clara-card-generator/main/assets';

  async function fetchBase64(filename) {
    try {
      const r = await fetch(baseUrl + '/' + encodeURIComponent(filename));
      const ab = await r.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let bin = '';
      for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
      return 'data:image/png;base64,' + Buffer.from(bin, 'binary').toString('base64');
    } catch (e) { return null; }
  }

  const logoFile = isDark ? 'clara-logo-light.png' : 'clara-logo-dark.png';
  const [bgBase64, logoBase64, overlayBase64] = await Promise.all([
    fetchBase64(config.file),
    fetchBase64(logoFile),
    fetchBase64('overlay-' + industry.toLowerCase() + '.png')
  ]);

  // Headline split
  let lines = [];
  if (headline.replace(/\.$/, '').includes('.')) {
    lines = headline.split('.').filter(function(s) { return s.trim(); }).map(function(s) { return s.trim() + '.'; });
  } else {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(function(l) { return l; });
  }

  // ─── LAYOUT CONSTANTS ───────────────────────────────
  // Card
  const CARD_W = 1200;
  const CARD_H = 628;

  // Logo — 40px from top-left
  const LOGO_X = 40;
  const LOGO_Y = 40;
  const LOGO_W = 148;
  const LOGO_H = 42;

  // Content zone — starts below logo area
  // Top: 102px (40 logo + 20 gap = ~100, round to 102 per spec)
  // Left: 40px, Right edge: 560px (content width 520px)
  // Bottom: CARD_H - 52 = 576px
  const CZ_X = 40;
  const CZ_TOP = 115;
  const CZ_BOTTOM = CARD_H - 52; // 576
  const CZ_H = CZ_BOTTOM - CZ_TOP; // 474

  // Image container — right side
  // x: 600 (40 + 520 + 40), y: 77 (102 - 25 top offset), w: 560, h: 474
  const IMG_X = 600;
  const IMG_Y = 77;
  const IMG_W = 560;
  const IMG_H = 474;

  // Content elements — stacked from CZ_TOP with exact gaps
  const PILL_H = 34;
  const PILL_W = config.label.length * 7.5 + 32;
  const PILL_Y = CZ_TOP;

  // Gap between pill and headline: 16px
  const LINE_H = 56;
  const HEADLINE_Y = PILL_Y + PILL_H + 22;
  const HEADLINE_END_Y = HEADLINE_Y + lines.length * LINE_H;

  // Gap between headline and subheadline: 16px
  const SUB_Y = HEADLINE_END_Y + 16;
  const SUB_H = 26;

  // Gap between subheadline and stat: 32px
  const STAT_Y = SUB_Y + SUB_H + 32;
  const STAT_H = 24;

  // CTA group (button + link with 16px gap) — pinned to bottom with 40px margin
  const BTN_W = 230;
  const BTN_H = 48;
  const LINK_H = 20;
  const CTA_GROUP_H = BTN_H + 16 + LINK_H; // 84px

  // Position CTA group — use auto spacing but cap at bottom boundary
  let BTN_Y = STAT_Y + STAT_H + 32;
  const maxBtnY = CZ_BOTTOM - CTA_GROUP_H; // can't go below this
  if (BTN_Y > maxBtnY) BTN_Y = maxBtnY;
  const LINK_Y = BTN_Y + BTN_H + 16 + 14; // +14 for text baseline

  // ─── BUILD SVG ──────────────────────────────────────
  const parts = [];
  parts.push('<svg width="' + CARD_W + '" height="' + CARD_H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');

  // Background
  parts.push('<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="' + bg + '"/>');

  // Image — right side with gradient fade
  if (bgBase64) {
    parts.push('<defs>');
    parts.push('<clipPath id="imgClip"><rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" rx="16"/></clipPath>');
    parts.push('<linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">');
    parts.push('<stop offset="0%" style="stop-color:' + bg + ';stop-opacity:1"/>');
    parts.push('<stop offset="35%" style="stop-color:' + bg + ';stop-opacity:0"/>');
    parts.push('</linearGradient>');
    parts.push('</defs>');
    parts.push('<image x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" href="' + bgBase64 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.9"/>');
    parts.push('<rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" fill="url(#fade)"/>');
  }

  // Overlay widget — positioned in middle-right of image
if (overlayBase64) {
    const isLegal = industry.toLowerCase() === 'legal';
    const OV_W = isLegal ? 420 : 340;
    const OV_H = isLegal ? 340 : 200;
    const OV_X = isLegal ? IMG_X + 20 : IMG_X + 60;
    const OV_Y = isLegal ? IMG_Y + (IMG_H / 2) - 140 : IMG_Y + (IMG_H / 2) - 80;
    parts.push('<image x="' + OV_X + '" y="' + OV_Y + '" width="' + OV_W + '" height="' + OV_H + '" href="' + overlayBase64 + '" preserveAspectRatio="xMidYMid meet"/>');
  }

  // Clara logo
  if (logoBase64) {
    parts.push('<image x="' + LOGO_X + '" y="' + LOGO_Y + '" width="' + LOGO_W + '" height="' + LOGO_H + '" href="' + logoBase64 + '" preserveAspectRatio="xMinYMid meet"/>');
  }

  // Industry pill
  parts.push('<rect x="' + CZ_X + '" y="' + PILL_Y + '" width="' + PILL_W + '" height="' + PILL_H + '" rx="17" fill="none" stroke="' + accent + '" stroke-width="1.5"/>');
  parts.push('<text x="' + (CZ_X + PILL_W / 2) + '" y="' + (PILL_Y + PILL_H / 2 + 4) + '" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + config.label + '</text>');

  // Headline
  lines.forEach(function(line, i) {
    parts.push('<text x="' + CZ_X + '" y="' + (HEADLINE_Y + i * LINE_H) + '" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="' + textColor + '" letter-spacing="-2">' + line + '</text>');
  });

  // Subheadline
  parts.push('<text x="' + CZ_X + '" y="' + SUB_Y + '" font-family="Arial,sans-serif" font-size="17" fill="' + subColor + '">' + subheadline + '</text>');

  // Pain stat
  parts.push('<text x="' + CZ_X + '" y="' + STAT_Y + '" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="' + accent + '">' + painstat + '</text>');

  // CTA button
  parts.push('<rect x="' + CZ_X + '" y="' + BTN_Y + '" width="' + BTN_W + '" height="' + BTN_H + '" rx="24" fill="' + config.ctaColor + '"/>');
  parts.push('<text x="' + (CZ_X + BTN_W / 2) + '" y="' + (BTN_Y + BTN_H / 2 + 5) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + config.ctaTextColor + '" text-anchor="middle" letter-spacing="0.5">' + cta.toUpperCase() + '</text>');

  // URL link
  parts.push('<text x="' + (CZ_X + BTN_W / 2) + '" y="' + LINK_Y + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + urlColor + '" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>');

  parts.push('</svg>');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(parts.join('\n'));
};
