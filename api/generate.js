module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'dark';
  const headline = req.query.headline || 'Your next client just called.';
  const subheadline = req.query.subheadline || 'Nobody answered.';
  const painstat = req.query.painstat || '62% of callers never call back.';
  const cta = req.query.cta || 'Book a Demo';
  const bgImageUrl = req.query.bgImageUrl;

  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const accent = '#C9A84C';

  let bgImage = '';
  if (bgImageUrl) {
    try {
      const imgRes = await fetch(bgImageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64 = Buffer.from(binary, 'binary').toString('base64');
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      bgImage = `data:${contentType};base64,${base64}`;
    } catch (e) {
      bgImage = '';
    }
  }

  const bgImageTag = bgImage
    ? `<image x="600" y="0" width="600" height="628" href="${bgImage}" preserveAspectRatio="xMidYMid slice"/>`
    : '';

  const svg = `<svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="1200" height="628" fill="${bg}"/>
    ${bgImageTag}
    <defs>
      <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${bg};stop-opacity:1" />
        <stop offset="60%" style="stop-color:${bg};stop-opacity:0" />
      </linearGradient>
    </defs>
    <rect x="540" y="0" width="660" height="628" fill="url(#fade)"/>
    <rect x="0" y="0" width="8" height="628" fill="${accent}"/>
    <rect x="60" y="60" width="160" height="32" rx="16" fill="${accent}"/>
    <text x="140" y="82" font-family="Arial,sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${industry.toUpperCase()}</text>
    <text x="60" y="160" font-family="Arial,sans-serif" font-size="52" font-weight="bold" fill="${textColor}">${headline}</text>
    <text x="60" y="230" font-family="Arial,sans-serif" font-size="22" fill="${isDark ? '#AAAACC' : '#555577'}">${subheadline}</text>
    <text x="60" y="290" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="${accent}">${painstat}</text>
    <rect x="60" y="320" width="200" height="52" rx="8" fill="${accent}"/>
    <text x="160" y="352" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="#000000" text-anchor="middle">${cta}</text>
    <text x="280" y="352" font-family="Arial,sans-serif" font-size="14" fill="${isDark ? '#8888AA' : '#9999BB'}">pruxin.com/clara</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
