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
    'legal':       { file: 'legal.png', accent: '#4573CD', label: 'AI FOR LEGAL PRACTICES', ctaColor: '#4573CD', ctaTextColor: '#FFFFFF' },
    'realestate':  { file: 'realestate.png', accent: '#E07B30', label: 'AI FOR ESTATE AGENTS', ctaColor: '#E07B30', ctaTextColor: '#FFFFFF' },
    'restaurants': { file: 'restaurants.png', accent: '#038D80', label: 'AI FOR HOSPITALITY', ctaColor: '#038D80', ctaTextColor: '#FFFFFF' }
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

  const logoFile = isDark ? 'clara-logo-light.png' : 'clara-logo-dark.png';
  const [bgBase64, logoBase64, overlayBase64] = await Promise.all([
    fetchBase64(config.file),
    fetchBase64(logoFile),
    fetchBase64('overlay-' + industry.toLowerCase() + '.png')
  ]);

  // Card dimensions based on platform
  const isInstagram = platform === 'instagram';
  const CARD_W = isInstagram ? 1080 : 1200;
  const CARD_H = isInstagram ? 1080 : 628;

  // Image zone
  const IMG_X = isInstagram ? 0 : 540;
  const IMG_Y = isInstagram ? CARD_H / 2 : 36;
  const IMG_W = isInstagram ? CARD_W : 620;
  const IMG_H = isInstagram ? CARD_H / 2 : 556;

  // Content zone
  const CONTENT_W = isInstagram ? CARD_W : 560;

  // Headline split
  let lines = [];
  if (headline.replace(/\.$/, '').includes('.')) {
    lines = headline.split('.').filter(function(s) { return s.trim(); }).map(function(s) { return s.trim() + '.'; });
  } else {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(function(l) { return l; });
  }

  // Layout positions
  const pillWidth = config.label.length * 7.5 + 32;
  const pillX = 40;
  const pillY = isInstagram ? 40 : 115;
  const pillH = 34;
  const pillTextY = pillY + pillH / 2 + 4;
  const headlineStartY = pillY + pillH + 22 + 46;
  const lineHeight = isInstagram ? 64 : 58;
  const headlineEndY = headlineStartY + (lines.length * lineHeight);
  const headlineFontSize = isInstagram ? 52 : 46;

  // Subheadline split
  const subWords = subheadline.split(' ');
  let subLine1 = '';
  let subLine2 = '';
  let charCount = 0;
  subWords.forEach(function(word) {
    if (charCount <= 45) {
      subLine1 += (subLine1 ? ' ' : '') + word;
      charCount += word.length + 1;
    } else {
      subLine2 += (subLine2 ? ' ' : '') + word;
    }
  });

  const parts = [];
  parts.push('<svg width="' + CARD_W + '" height="' + CARD_H + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
  parts.push('<rect width="' + CARD_W + '" height="' + CARD_H + '" fill="' + bg + '"/>');

  if (bgBase64) {
    const gradientDir = isInstagram ? 'x1="0%" y1="0%" x2="0%" y2="100%"' : 'x1="0%" y1="0%" x2="100%" y2="0%"';
    parts.push('<defs>');
    parts.push('<clipPath id="imgClip"><rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" rx="0"/></clipPath>');
    parts.push('<linearGradient id="fade" ' + gradientDir + '>');
    parts.push('<stop offset="0%" style="stop-color:' + bg + ';stop-opacity:' + (isInstagram ? '1' : '1') + '"/>');
    parts.push('<stop offset="' + (isInstagram ? '30%' : '45%') + '" style="stop-color:' + bg + ';stop-opacity:0"/>');
    parts.push('</linearGradient>');
    parts.push('</defs>');
    parts.push('<image x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" href="' + bgBase64 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.9"/>');
    parts.push('<rect x="' + IMG_X + '" y="' + IMG_Y + '" width="' + IMG_W + '" height="' + IMG_H + '" fill="url(#fade)"/>');
  }

  if (overlayBase64) {
    const isLegal = industry.toLowerCase() === 'legal';
    const OV_W = isLegal ? 420 : 340;
    const OV_H = isLegal ? 340 : 200;
    const OV_X = isInstagram ? (CARD_W / 2 - OV_W / 2) : (isLegal ? 600 : 660);
    const OV_Y = isInstagram ? (IMG_Y + 60) : (isLegal ? 150 : 210);
    parts.push('<image x="' + OV_X + '" y="' + OV_Y + '" width="' + OV_W + '" height="' + OV_H + '" href="' + overlayBase64 + '" preserveAspectRatio="xMidYMid meet"/>');
  }

  if (logoBase64) {
    parts.push('<image x="40" y="' + (isInstagram ? 20 : 40) + '" width="148" height="42" href="' + logoBase64 + '" preserveAspectRatio="xMinYMid meet"/>');
  }

  // Industry pill
  parts.push('<rect x="' + pillX + '" y="' + pillY + '" width="' + pillWidth + '" height="' + pillH + '" rx="17" fill="none" stroke="' + accent + '" stroke-width="1.5"/>');
  parts.push('<text x="' + (pillX + pillWidth / 2) + '" y="' + pillTextY + '" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + config.label + '</text>');

  // Headline
  lines.forEach(function(line, i) {
    parts.push('<text x="40" y="' + (headlineStartY + i * lineHeight) + '" font-family="Arial,sans-serif" font-size="' + headlineFontSize + '" font-weight="900" fill="' + textColor + '" letter-spacing="-2">' + line + '</text>');
  });

  // Subheadline
  parts.push('<text x="40" y="' + (headlineEndY + 30) + '" font-family="Arial,sans-serif" font-size="17" fill="' + subColor + '">' + subLine1 + '</text>');
  if (subLine2) {
    parts.push('<text x="40" y="' + (headlineEndY + 55) + '" font-family="Arial,sans-serif" font-size="17" fill="' + subColor + '">' + subLine2 + '</text>');
  }

  // Pain stat
  const statY = subLine2 ? headlineEndY + 85 : headlineEndY + 68;
  parts.push('<text x="40" y="' + statY + '" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="' + accent + '">' + painstat + '</text>');

  // CTA button
  const btnY = statY + 28;
  parts.push('<rect x="40" y="' + btnY + '" width="230" height="48" rx="24" fill="' + config.ctaColor + '"/>');
  parts.push('<text x="155" y="' + (btnY + 30) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + config.ctaTextColor + '" text-anchor="middle" letter-spacing="0.5">' + cta.toUpperCase() + '</text>');

  // URL
  parts.push('<text x="155" y="' + (btnY + 68) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + urlColor + '" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>');

  parts.push('</svg>');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(parts.join('\n'));
};
