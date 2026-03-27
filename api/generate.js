module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'light';
  const headline = req.query.headline || 'Your phones ring at 9pm. Clara answers.';
  const subheadline = req.query.subheadline || 'Never miss a new client enquiry.';
  const painstat = req.query.painstat || '62% of clients switch firms due to poor communication';
  const cta = req.query.cta || 'Book a Demo';

  const industryConfig = {
    'accountants': { file: 'Accountants.png', accent: '#C9A84C', label: 'AI FOR ACCOUNTANCY FIRMS', ctaColor: '#C9A84C', ctaTextColor: '#0A0508' },
    'legal':        { file: 'Legal _ Solicitors.png', accent: '#4573CD', label: 'AI FOR LEGAL PRACTICES', ctaColor: '#4573CD', ctaTextColor: '#FFFFFF' },
    'realestate':   { file: 'Real Estate.png', accent: '#E07B30', label: 'AI FOR ESTATE AGENTS', ctaColor: '#E07B30', ctaTextColor: '#FFFFFF' },
    'restaurants':  { file: 'Restaurants _ Hospitality.png', accent: '#038D80', label: 'AI FOR HOSPITALITY', ctaColor: '#038D80', ctaTextColor: '#FFFFFF' }
  };

  const config = industryConfig[industry.toLowerCase()] || industryConfig['accountants'];
  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0A0508';
  const subColor = isDark ? '#AAAACC' : '#444444';
  const accent = config.accent;
  const baseUrl = 'https://raw.githubusercontent.com/PRUXIN/clara-card-generator/main/assets';

  async function fetchBase64(filename) {
    try {
      const res = await fetch(`${baseUrl}/${encodeURIComponent(filename)}`);
      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return `data:image/png;base64,${Buffer.from(binary, 'binary').toString('base64')}`;
    } catch (e) { return null; }
  }

  const [bgBase64, logoBase64, overlayBase64] = await Promise.all([
    fetchBase64(config.file),
    fetchBase64(isDark ? 'clara-logo-dark.png' : 'clara-logo-light.png'),
    fetchBase64(`overlay-${industry.toLowerCase()}.png`)
  ]);

  // Smart headline split
  let lines = [];
  if (headline.replace(/\.$/, '').includes('.')) {
    lines = headline.split('.').filter(s => s.trim()).map(s => s.trim() + '.');
  } else {
    const words = headline.split(' ');
    const mid = Math.ceil(words.length / 2);
    lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(l => l);
  }

  const headlineStartY = 130;
  const lineHeight = 58;
  const headlineEndY = headlineStartY + (lines.length * lineHeight);

  const pillWidth = config.label.length * 7.5 + 32;

  const svg = `<svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="1200" height="628" fill="${bg}"/>

    ${bgBase64 ? `
    <clipPath id="imgClip">
      <rect x="580" y="36" width="580" height="556" rx="16"/>
    </clipPath>
    <image x="580" y="36" width="580" height="556" href="${bgBase64}" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.85"/>
    <defs>
      <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${bg};stop-opacity:1"/>
        <stop offset="45%" style="stop-color:${bg};stop-opacity:0"/>
      </linearGradient>
    </defs>
    <rect x="580" y="36" width="580" height="556" fill="url(#fade)"/>
    ` : ''}

    ${overlayBase64 ? `<image x="700" y="160" width="420" height="320" href="${overlayBase64}" preserveAspectRatio="xMidYMid meet"/>` : ''}

    ${logoBase64 ? `<image x="40" y="20" width="148" height="42" href="${logoBase64}" preserveAspectRatio="xMinYMid meet"/>` : ''}

    <rect x="40" y="78" width="${pillWidth}" height="34" rx="17" fill="none" stroke="${accent}" stroke-width="1.5"/>
    <text x="${40 + pillWidth / 2}" y="100" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="${accent}" text-anchor="middle" letter-spacing="1">${config.label}</text>

    ${lines.map((line, i) => `<text x="40" y="${headlineStartY + (i * lineHeight)}" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="${textColor}" letter-spacing="-2">${line}</text>`).join('\n')}

    <text x="40" y="${headlineEndY + 30}" font-family="Arial,sans-serif" font-size="17" fill="${subColor}">${subheadline}</text>

    <text x="40" y="${headlineEndY + 68}" font-family="Arial,sans-serif" font-size="15" font-weight="bold" fill="${accent}">${painstat}</text>

    <rect x="40" y="${headlineEndY + 90}" width="230" height="48" rx="24" fill="${config.ctaColor}"/>
    <text x="155" y="${headlineEndY + 120}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="${config.ctaTextColor}" text-anchor="middle" letter-spacing="0.5">${cta.toUpperCase()}</text>

    <text x="155" y="${headlineEndY + 158}" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#132F67" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
