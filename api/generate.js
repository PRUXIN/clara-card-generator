module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'dark';
  const headline = req.query.headline || 'Your phones ring at 9pm. Clara answers.';
  const subheadline = req.query.subheadline || 'Never miss a new client enquiry.';
  const painstat = req.query.painstat || '62% of clients switch firms due to poor communication';
  const cta = req.query.cta || 'Book a Demo';
  const platform = req.query.platform || 'linkedin';

  const industryConfig = {
    'accountants': { file: 'accountants.png', accent: '#C9A84C', label: 'AI FOR ACCOUNTANCY FIRMS', ctaColor: '#C9A84C', ctaTextColor: '#0A0508' },
    'legal':       { file: 'legal.png',        accent: '#4573CD', label: 'AI FOR LEGAL PRACTICES',   ctaColor: '#4573CD', ctaTextColor: '#FFFFFF' },
    'realestate':  { file: 'realestate.png',   accent: '#E07B30', label: 'AI FOR ESTATE AGENTS',     ctaColor: '#E07B30', ctaTextColor: '#FFFFFF' },
    'restaurants': { file: 'restaurants.png',  accent: '#038D80', label: 'AI FOR HOSPITALITY',       ctaColor: '#038D80', ctaTextColor: '#FFFFFF' }
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
      const chunk = 1024;
      for (let i = 0; i < bytes.length; i += chunk) {
        bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
      }
      const ext = filename.endsWith('.jpg') ? 'jpeg' : 'png';
      return 'data:image/' + ext + ';base64,' + btoa(bin);
    } catch (e) { return null; }
  }

  const overlayFileMap = {
    'accountants': 'overlay-accountants.png',
    'legal':       isDark ? 'overlay-legal-dark.png'        : 'overlay-legal-light.png',
    'realestate':  'overlay-realestate.png',
    'restaurants': isDark ? 'overlay-restaurants-dark.png'  : 'overlay-restaurants-light.png'
  };

  const logoFile = isDark ? 'clara-logo-light.png' : 'clara-logo-dark.png';
  const [bgBase64, logoBase64, overlayBase64] = await Promise.all([
    fetchBase64(config.file),
    fetchBase64(logoFile),
    fetchBase64(overlayFileMap[industry.toLowerCase()])
  ]);

  // ── Headline split ──────────────────────────────────────
  // Rule 1: if multiple sentences (periods mid-string), split at each period
  // Rule 2: otherwise split by words, max 3 words per line (4 if >6 words)
  function splitHeadline(text) {
    const stripped = text.replace(/\.$/, '');
    if (stripped.includes('.')) {
      return text.split('.').filter(function(s) { return s.trim(); }).map(function(s) { return s.trim() + '.'; });
    }
    const words = text.split(' ');
    if (words.length <= 3) return [text];
    const maxPerLine = words.length > 6 ? 4 : 3;
    const result = [];
    for (let i = 0; i < words.length; i += maxPerLine) {
      result.push(words.slice(i, i + maxPerLine).join(' '));
    }
    return result;
  }

  // ── Subheadline split (max 50 chars per line, max 2 lines) ──
  function splitSub(text, maxChars) {
    const words = text.split(' ');
    const result = [];
    let current = '';
    words.forEach(function(word) {
      const test = current ? current + ' ' + word : word;
      if (test.length <= maxChars) {
        current = test;
      } else {
        if (current) result.push(current);
        current = word;
      }
    });
    if (current) result.push(current);
    return result.slice(0, 2);
  }

  const lines = splitHeadline(headline);
  const isInstagram = platform === 'instagram';
  const subLines = splitSub(subheadline, isInstagram ? 50 : 45);

  // ── LINKEDIN / FACEBOOK (1200×628) ─────────────────────
  if (!isInstagram) {
    const CARD_W = 1200;
    const CARD_H = 628;
    const PAD = 40;

    // Logo: 40px from top-left
    const LOGO_Y = 40;
    const LOGO_H = 42;

    // Pill: 20px below logo
    const PILL_Y = LOGO_Y + LOGO_H + 20;   // 102
    const PILL_H = 34;
    const pillWidth = config.label.length * 7.5 + 32;

    // Headline: 16px below pill + 46px baseline
    const HL_FONT = 46;
    const HL_LINE_H = 56;
    const HEADLINE_Y = PILL_Y + PILL_H + 16 + HL_FONT;            // 198
    const HEADLINE_END = HEADLINE_Y + (lines.length - 1) * HL_LINE_H;

    // Subheadline: 16px below headline + 17px baseline
    const SUB_FONT = 17;
    const SUB_LINE_H = 26;
    const SUB_Y = HEADLINE_END + 16 + SUB_FONT;

    // Stat: 32px below last sub line + 15px baseline
    const lastSubY = subLines.length > 1 ? SUB_Y + SUB_LINE_H : SUB_Y;
    const STAT_Y = lastSubY + 32 + 15;

    // CTA button: 28px below stat
    const BTN_W = 230;
    const BTN_H = 48;
    const BTN_Y = STAT_Y + 28;

    // URL: 20px below button
    const URL_Y = BTN_Y + BTN_H + 20;

    const parts = [];
    parts.push('<svg width="' + CARD_W + '" height="' + CARD_H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
    parts.push('<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="' + bg + '"/>');

    if (bgBase64) {
      parts.push('<defs>');
      parts.push('<clipPath id="imgClip"><rect x="540" y="36" width="620" height="556" rx="16"/></clipPath>');
      parts.push('<linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">');
      parts.push('<stop offset="0%" style="stop-color:' + bg + ';stop-opacity:1"/>');
      parts.push('<stop offset="45%" style="stop-color:' + bg + ';stop-opacity:0"/>');
      parts.push('</linearGradient>');
      parts.push('</defs>');
      parts.push('<image x="540" y="36" width="620" height="556" href="' + bgBase64 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.9"/>');
      parts.push('<rect x="540" y="36" width="620" height="556" fill="url(#fade)"/>');
    }

    if (overlayBase64) {
      const ind = industry.toLowerCase();
      const isLegal = ind === 'legal';
      const OV_W = isLegal ? 420 : 340;
      const OV_H = isLegal ? 340 : 200;
      const OV_X = ind === 'accountants' ? 780 : isLegal ? 600 : 660;
      const OV_Y = ind === 'accountants' ? 360 : isLegal ? 150 : 210;
      parts.push('<image x="' + OV_X + '" y="' + OV_Y + '" width="' + OV_W + '" height="' + OV_H + '" href="' + overlayBase64 + '" preserveAspectRatio="xMidYMid meet"/>');
    }

    if (logoBase64) {
      parts.push('<image x="' + PAD + '" y="' + LOGO_Y + '" width="148" height="42" href="' + logoBase64 + '" preserveAspectRatio="xMinYMid meet"/>');
    }

    parts.push('<rect x="' + PAD + '" y="' + PILL_Y + '" width="' + pillWidth + '" height="' + PILL_H + '" rx="17" fill="none" stroke="' + accent + '" stroke-width="1.5"/>');
    parts.push('<text x="' + (PAD + pillWidth / 2) + '" y="' + (PILL_Y + PILL_H / 2 + 5) + '" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + config.label + '</text>');

    lines.forEach(function(line, i) {
      parts.push('<text x="' + PAD + '" y="' + (HEADLINE_Y + i * HL_LINE_H) + '" font-family="Arial,sans-serif" font-size="' + HL_FONT + '" font-weight="900" fill="' + textColor + '" letter-spacing="-2">' + line + '</text>');
    });

    subLines.forEach(function(line, i) {
      parts.push('<text x="' + PAD + '" y="' + (SUB_Y + i * SUB_LINE_H) + '" font-family="Arial,sans-serif" font-size="' + SUB_FONT + '" fill="' + subColor + '">' + line + '</text>');
    });

    parts.push('<text x="' + PAD + '" y="' + STAT_Y + '" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="' + accent + '">' + painstat + '</text>');
    parts.push('<rect x="' + PAD + '" y="' + BTN_Y + '" width="' + BTN_W + '" height="' + BTN_H + '" rx="24" fill="' + config.ctaColor + '"/>');
    parts.push('<text x="' + (PAD + BTN_W / 2) + '" y="' + (BTN_Y + BTN_H / 2 + 5) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + config.ctaTextColor + '" text-anchor="middle" letter-spacing="0.5">' + cta.toUpperCase() + '</text>');
    parts.push('<text x="' + (PAD + BTN_W / 2) + '" y="' + URL_Y + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + urlColor + '" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>');
    parts.push('</svg>');

    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(200).send(parts.join('\n'));
  }

  // ── INSTAGRAM (1080×1080) ───────────────────────────────
  const CARD_W = 1080;
  const CARD_H = 1080;
  const PAD = 40;
  const GAP = 20;

  const LOGO_Y = PAD;                          // 40
  const LOGO_H = 42;
  const IMG_X = PAD;
  const IMG_Y = LOGO_Y + LOGO_H + GAP;         // 102
  const IMG_W = 1000;
  const IMG_H = 435;
  const IMG_BOTTOM = IMG_Y + IMG_H;             // 537

  const PILL_Y = IMG_BOTTOM + GAP;              // 557
  const PILL_H = 37;
  const pillWidth = config.label.length * 9.2 + 32;

  const HL_FONT = 72;
  const HL_LINE_H = 87;
  const HEADLINE_Y = PILL_Y + PILL_H + 16 + HL_FONT;              // 682
  const HEADLINE_END = HEADLINE_Y + (lines.length - 1) * HL_LINE_H;

  const SUB_FONT = 24;
  const SUB_LINE_H = 36;
  const SUB_Y = HEADLINE_END + 16 + SUB_FONT;
  const lastSubY = subLines.length > 1 ? SUB_Y + SUB_LINE_H : SUB_Y;
  const STAT_Y = lastSubY + 32 + SUB_FONT;

  const BTN_H = 80;
  const BTN_W = CARD_W - PAD * 2;
  const BTN_Y = CARD_H - PAD - BTN_H;          // always 960

  const grad1End = isDark ? '#07091B' : '#FFFFFF';

  const parts = [];
  parts.push('<svg width="' + CARD_W + '" height="' + CARD_H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
  parts.push('<defs>');
  parts.push('<clipPath id="imgClip"><rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" rx="16"/></clipPath>');
  parts.push('<linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">');
  parts.push('<stop offset="0%" style="stop-color:' + grad1End + ';stop-opacity:0"/>');
  parts.push('<stop offset="100%" style="stop-color:' + grad1End + ';stop-opacity:1"/>');
  parts.push('</linearGradient>');
  parts.push('</defs>');

  parts.push('<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="' + bg + '"/>');

  if (logoBase64) {
    parts.push('<image x="' + PAD + '" y="' + LOGO_Y + '" width="147" height="42" href="' + logoBase64 + '" preserveAspectRatio="xMinYMid meet"/>');
  }

  if (bgBase64) {
    parts.push('<image x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" href="' + bgBase64 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)"/>');
    parts.push('<rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" fill="url(#grad1)" clip-path="url(#imgClip)"/>');
  }

  if (overlayBase64) {
    const ind = industry.toLowerCase();
    const isLegal = ind === 'legal';
    const OV_W = isLegal ? 360 : 280;
    const OV_H = isLegal ? 290 : 170;
    let OV_X, OV_Y;
    if (ind === 'accountants') {
      OV_X = IMG_X + IMG_W - OV_W - 40;
      OV_Y = IMG_Y + IMG_H - OV_H - 30;
    } else if (ind === 'restaurants') {
      OV_X = IMG_X + (IMG_W - OV_W) / 2;
      OV_Y = IMG_Y + 40;
    } else {
      OV_X = IMG_X + (IMG_W - OV_W) / 2;
      OV_Y = IMG_Y + (IMG_H - OV_H) / 2;
    }
    parts.push('<image x="' + OV_X + '" y="' + OV_Y + '" width="' + OV_W + '" height="' + OV_H + '" href="' + overlayBase64 + '" preserveAspectRatio="xMidYMid meet"/>');
  }

  parts.push('<rect x="' + PAD + '" y="' + PILL_Y + '" width="' + pillWidth + '" height="' + PILL_H + '" rx="17" fill="none" stroke="' + accent + '" stroke-width="1.5"/>');
  parts.push('<text x="' + (PAD + pillWidth / 2) + '" y="' + (PILL_Y + PILL_H / 2 + 5) + '" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="700" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + config.label + '</text>');
  parts.push('<text x="' + (CARD_W - PAD) + '" y="' + (PILL_Y + PILL_H / 2 + 5) + '" font-family="Inter,Arial,sans-serif" font-size="16" font-weight="600" fill="#B4C9EB" text-anchor="end" text-decoration="underline" letter-spacing="-0.5">pruxin.com/clara</text>');

  lines.forEach(function(line, i) {
    parts.push('<text x="' + PAD + '" y="' + (HEADLINE_Y + i * HL_LINE_H) + '" font-family="Inter,Arial,sans-serif" font-size="' + HL_FONT + '" font-weight="700" fill="' + textColor + '" letter-spacing="-2">' + line + '</text>');
  });

  subLines.forEach(function(line, i) {
    parts.push('<text x="' + PAD + '" y="' + (SUB_Y + i * SUB_LINE_H) + '" font-family="Inter,Arial,sans-serif" font-size="' + SUB_FONT + '" font-weight="400" fill="' + subColor + '" letter-spacing="-0.5">' + line + '</text>');
  });

  parts.push('<text x="' + PAD + '" y="' + STAT_Y + '" font-family="Inter,Arial,sans-serif" font-size="' + SUB_FONT + '" font-weight="500" fill="' + accent + '" letter-spacing="-0.5">' + painstat + '</text>');

  parts.push('<rect x="' + PAD + '" y="' + BTN_Y + '" width="' + BTN_W + '" height="' + BTN_H + '" rx="52" fill="' + config.ctaColor + '"/>');
  parts.push('<text x="' + (CARD_W / 2) + '" y="' + (BTN_Y + BTN_H / 2 + 9) + '" font-family="Inter,Arial,sans-serif" font-size="24" font-weight="700" fill="' + config.ctaTextColor + '" text-anchor="middle" letter-spacing="-0.5">' + cta.toUpperCase() + '</text>');

  parts.push('</svg>');
  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(parts.join('\n'));
};
