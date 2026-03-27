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

  // Smart headline split
  let lines = [];
  if (headline.replace(/\.$/, '').includes('.')) {
    lines = headline.split('.').filter(function(s) { return s.trim(); }).map(function(s) { return s.trim() + '.'; });
  } else {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(function(l) { return l; });
  }

  const pillWidth = config.label.length * 7.5 + 32;
  const pillX = 40;
  const pillY = 82;
  const pillH = 34;
  const pillTextY = pillY + pillH / 2 + 4;
  const headlineStartY = pillY + pillH + 28;
  const lineHeight = 58;
  const headlineEndY = headlineStartY + (lines.length * lineHeight);

  let svgParts = [];

  svgParts.push('<svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">');
  svgParts.push('<rect width="1200" height="628" fill="' + bg + '"/>');

  if (bgBase64) {
    svgParts.push('<defs>');
    svgParts.push('<clipPath id="imgClip"><rect x="540" y="36" width="620" height="556" rx="16"/></clipPath>');
    svgParts.push('<linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">');
    svgParts.push('<stop offset="0%" style="stop-color:' + bg + ';stop-opacity:1"/>');
    svgParts.push('<stop offset="45%" style="stop-color:' + bg + ';stop-opacity:0"/>');
    svgParts.push('</linearGradient>');
    svgParts.push('</defs>');
    svgParts.push('<image x="540" y="36" width="620" height="556" href="' + bgBase64 + '" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.85"/>');
    svgParts.push('<rect x="540" y="36" width="620" height="556" fill="url(#fade)"/>');
  }

  if (overlayBase64) {
    svgParts.push('<image x="700" y="180" width="380" height="260" href="' + overlayBase64 + '" preserveAspectRatio="xMidYMid meet"/>');
  }

  if (logoBase64) {
    svgParts.push('<image x="40" y="20" width="148" height="42" href="' + logoBase64 + '" preserveAspectRatio="xMinYMid meet"/>');
  }

  // Industry pill
  svgParts.push('<rect x="' + pillX + '" y="' + pillY + '" width="' + pillWidth + '" height="' + pillH + '" rx="17" fill="none" stroke="' + accent + '" stroke-width="1.5"/>');
  svgParts.push('<text x="' + (pillX + pillWidth / 2) + '" y="' + pillTextY + '" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="' + accent + '" text-anchor="middle" letter-spacing="1">' + config.label + '</text>');

  // Headline lines
  lines.forEach(function(line, i) {
    svgParts.push('<text x="40" y="' + (headlineStartY + i * lineHeight) + '" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="' + textColor + '" letter-spacing="-2">' + line + '</text>');
  });

  // Subheadline
  svgParts.push('<text x="40" y="' + (headlineEndY + 30) + '" font-family="Arial,sans-serif" font-size="17" fill="' + subColor + '">' + subheadline + '</text>');

  // Pain stat
  svgParts.push('<text x="40" y="' + (headlineEndY + 68) + '" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="' + accent + '">' + painstat + '</text>');

  // CTA button
  svgParts.push('<rect x="40" y="' + (headlineEndY + 90) + '" width="230" height="48" rx="24" fill="' + config.ctaColor + '"/>');
  svgParts.push('<text x="155" y="' + (headlineEndY + 120) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + config.ctaTextColor + '" text-anchor="middle" letter-spacing="0.5">' + cta.toUpperCase() + '</text>');

  // URL
  svgParts.push('<text x="155" y="' + (headlineEndY + 158) + '" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="' + urlColor + '" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>');

  svgParts.push('</svg>');

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svgParts.join('\n'));
};
