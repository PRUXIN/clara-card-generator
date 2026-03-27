module.exports = async function handler(req, res) {
  const industry = req.query.industry || 'accountants';
  const theme = req.query.theme || 'dark';
  const headline = req.query.headline || 'Your phones ring at 9pm. Clara answers.';
  const subheadline = req.query.subheadline || 'Never miss a new client enquiry.';
  const painstat = req.query.painstat || '62% of clients switch firms due to poor communication';
  const cta = req.query.cta || 'Book a Demo';

  const imageMap = {
    'accountants': 'Accountants.png',
    'legal': 'Legal _ Solicitors.png',
    'realestate': 'Real Estate.png',
    'restaurants': 'Restaurants _ Hospitality.png'
  };

  const imageFile = imageMap[industry.toLowerCase()] || 'Accountants.png';
  const imageUrl = `https://raw.githubusercontent.com/PRUXIN/clara-card-generator/main/assets/${encodeURIComponent(imageFile)}`;

  let bgBase64 = null;
  try {
    const imgRes = await fetch(imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    bgBase64 = `data:image/png;base64,${Buffer.from(binary, 'binary').toString('base64')}`;
  } catch (e) {
    bgBase64 = null;
  }

  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#0A0508';
  const subColor = isDark ? '#AAAACC' : '#333333';
  const accent = '#C9A84C';
  const statColor = '#B98D10';
  const urlColor = isDark ? '#8888AA' : '#132F67';

  // Split headline into two lines at word boundary around character 22
  const words = headline.split(' ');
  let line1 = '';
  let line2 = '';
  let count = 0;
  for (let i = 0; i < words.length; i++) {
    if (count < 22) {
      line1 += (line1 ? ' ' : '') + words[i];
      count += words[i].length + 1;
    } else {
      line2 += (line2 ? ' ' : '') + words[i];
    }
  }

  const bgImageTag = bgBase64 ? `
    <clipPath id="imgClip">
      <rect x="580" y="36" width="580" height="556" rx="16"/>
    </clipPath>
    <image x="580" y="36" width="580" height="556" href="${bgBase64}" preserveAspectRatio="xMidYMid slice" clip-path="url(#imgClip)" opacity="0.85"/>
    <defs>
      <linearGradient id="fade" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:${bg};stop-opacity:1"/>
        <stop offset="50%" style="stop-color:${bg};stop-opacity:0"/>
      </linearGradient>
    </defs>
    <rect x="580" y="36" width="580" height="556" fill="url(#fade)"/>
    <rect x="820" y="350" width="180" height="36" rx="18" fill="#E13A3A"/>
    <circle cx="843" cy="368" r="8" fill="white" opacity="0.3"/>
    <text x="863" y="373" font-family="Arial,sans-serif" font-size="11" font-weight="bold" fill="white" letter-spacing="0.8">MISSED CALL</text>
  ` : '';

  const svg = `<svg width="1200" height="628" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <rect width="1200" height="628" fill="${bg}"/>
    ${bgImageTag}

    <!-- Industry pill -->
    <rect x="40" y="80" width="220" height="36" rx="18" fill="none" stroke="${accent}" stroke-width="1.5"/>
    <text x="150" y="103" font-family="Arial,sans-serif" font-size="12" font-weight="bold" fill="${accent}" text-anchor="middle" letter-spacing="1">${industry.toUpperCase()}</text>

    <!-- Headline line 1 -->
    <text x="40" y="200" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="${textColor}" letter-spacing="-2">${line1}</text>
    <!-- Headline line 2 -->
    <text x="40" y="258" font-family="Arial,sans-serif" font-size="46" font-weight="bold" fill="${textColor}" letter-spacing="-2">${line2}</text>

    <!-- Subheadline -->
    <text x="40" y="305" font-family="Arial,sans-serif" font-size="18" fill="${subColor}">${subheadline}</text>

    <!-- Pain stat -->
    <text x="40" y="355" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="${statColor}">${painstat}</text>

    <!-- CTA Button -->
    <rect x="40" y="390" width="180" height="48" rx="24" fill="${accent}"/>
    <text x="130" y="420" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="#0A0508" text-anchor="middle" letter-spacing="0.5">${cta.toUpperCase()}</text>

    <!-- URL centered under CTA -->
    <text x="130" y="460" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="${urlColor}" text-anchor="middle" text-decoration="underline">pruxin.com/clara</text>
  </svg>`;

  res.setHeader('Content-Type', 'image/svg+xml');
  res.status(200).send(svg);
};
