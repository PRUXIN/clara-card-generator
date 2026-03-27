const { Resvg } = require('@resvg/resvg-js');

module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'dark';
  const headline = req.query.headline || 'Your next client just called.';
  const subheadline = req.query.subheadline || 'Nobody answered.';
  const painstat = req.query.painstat || '62% of callers never call back.';
  const cta = req.query.cta || 'Book a Demo';

  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const accent = '#C9A84C';

  const svg = `
    <svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="628" fill="${bg}"/>
      <rect x="0" y="0" width="8" height="628" fill="${accent}"/>
      <rect x="60" y="80" width="160" height="32" rx="16" fill="${accent}"/>
      <text x="140" y="102" font-family="sans-serif" font-size="13" font-weight="bold" fill="#000000" text-anchor="middle">${industry.toUpperCase()}</text>
      <foreignObject x="60" y="140" width="560" height="200">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family:sans-serif;font-size:48px;font-weight:bold;color:${textColor};line-height:1.1;">${headline}</div>
      </foreignObject>
      <text x="60" y="380" font-family="sans-serif" font-size="20" fill="${isDark ? '#AAAACC' : '#555577'}">${subheadline}</text>
      <text x="60" y="430" font-family="sans-serif" font-size="16" font-weight="bold" fill="${accent}">${painstat}</text>
      <rect x="60" y="460" width="180" height="50" rx="8" fill="${accent}"/>
      <text x="150" y="491" font-family="sans-serif" font-size="16" font-weight="bold" fill="#000000" text-anchor="middle">${cta}</text>
      <text x="260" y="491" font-family="sans-serif" font-size="14" fill="${isDark ? '#8888AA' : '#9999BB'}">pruxin.com/clara</text>
    </svg>
  `;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
