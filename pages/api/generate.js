import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const url = new URL(req.url, 'https://clara-card-generator.vercel.app');
    const searchParams = url.searchParams;

    const industry = searchParams.get('industry') || 'accountants';
    const theme = searchParams.get('theme') || 'dark';
    const headline = searchParams.get('headline') || 'Your phones ring at 9pm. Clara answers.';
    const subheadline = searchParams.get('subheadline') || 'Never miss a new client enquiry.';
    const painstat = searchParams.get('painstat') || '62% of clients switch firms due to poor communication';
    const cta = searchParams.get('cta') || 'Book a Demo';

    const industryConfig = {
      'accountants': { file: 'accountants.jpg', accent: '#C9A84C', label: 'AI FOR ACCOUNTANCY FIRMS', ctaColor: '#C9A84C', ctaTextColor: '#0A0508' },
      'legal':       { file: 'legal.jpg', accent: '#4573CD', label: 'AI FOR LEGAL PRACTICES', ctaColor: '#4573CD', ctaTextColor: '#FFFFFF' },
      'realestate':  { file: 'realestate.jpg', accent: '#E07B30', label: 'AI FOR ESTATE AGENTS', ctaColor: '#E07B30', ctaTextColor: '#FFFFFF' },
      'restaurants': { file: 'restaurants.jpg', accent: '#038D80', label: 'AI FOR HOSPITALITY', ctaColor: '#038D80', ctaTextColor: '#FFFFFF' }
    };

    const config = industryConfig[industry.toLowerCase()] || industryConfig['accountants'];
    const isDark = theme === 'dark';
    const bg = isDark ? '#07091A' : '#FFFFFF';
    const textColor = isDark ? '#FFFFFF' : '#0A0508';
    const subColor = isDark ? '#AAAACC' : '#444444';
    const urlColor = isDark ? '#8899BB' : '#132F67';
    const accent = config.accent;
    const baseUrl = 'https://raw.githubusercontent.com/PRUXIN/clara-card-generator/main/assets';

    async function fetchImage(filename) {
      const r = await fetch(baseUrl + '/' + encodeURIComponent(filename));
      const ab = await r.arrayBuffer();
      return ab;
    }

    const logoFile = isDark ? 'clara-logo-light.png' : 'clara-logo-dark.png';
    const [bgBuffer, logoBuffer, overlayBuffer] = await Promise.all([
      fetchImage(config.file),
      fetchImage(logoFile),
      fetchImage('overlay-' + industry.toLowerCase() + '.png')
    ]);

    const bgSrc = `data:image/jpeg;base64,${btoa(String.fromCharCode(...new Uint8Array(bgBuffer)))}`;
    const logoSrc = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))}`;
    const overlaySrc = `data:image/png;base64,${btoa(String.fromCharCode(...new Uint8Array(overlayBuffer)))}`;

    let lines = [];
    if (headline.replace(/\.$/, '').includes('.')) {
      lines = headline.split('.').filter(s => s.trim()).map(s => s.trim() + '.');
    } else {
      const words = headline.split(' ');
      const mid = Math.ceil(words.length / 2);
      lines = [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(l => l);
    }

    return new ImageResponse(
      (
        <div style={{ width: '1200px', height: '628px', display: 'flex', backgroundColor: bg, position: 'relative', overflow: 'hidden', fontFamily: 'sans-serif' }}>
          
          {/* Background image */}
          <div style={{ position: 'absolute', right: 0, top: 0, width: '620px', height: '628px', display: 'flex' }}>
            <img src={bgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, ' + bg + ' 0%, transparent 50%)', display: 'flex' }} />
          </div>

          {/* Overlay */}
          <img src={overlaySrc} style={{ position: 'absolute', right: '40px', top: '180px', width: '340px', objectFit: 'contain' }} />

          {/* Left content */}
          <div style={{ position: 'absolute', left: 0, top: 0, width: '600px', height: '628px', display: 'flex', flexDirection: 'column', padding: '40px' }}>
            
            <img src={logoSrc} style={{ width: '148px', height: '42px', objectFit: 'contain', marginBottom: '20px' }} />

            <div style={{ display: 'flex', border: '1.5px solid ' + accent, borderRadius: '17px', padding: '8px 16px', marginBottom: '20px', alignSelf: 'flex-start' }}>
              <span style={{ color: accent, fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px' }}>{config.label}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', marginBottom: '16px' }}>
              {lines.map((line, i) => (
                <span key={i} style={{ fontSize: '46px', fontWeight: 'bold', color: textColor, lineHeight: 1.15, letterSpacing: '-2px' }}>{line}</span>
              ))}
            </div>

            <div style={{ fontSize: '17px', color: subColor, marginBottom: '16px', lineHeight: 1.5 }}>{subheadline}</div>

            <div style={{ fontSize: '15px', fontWeight: 'bold', color: accent, marginBottom: '32px' }}>{painstat}</div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ backgroundColor: config.ctaColor, borderRadius: '24px', padding: '14px 32px', display: 'flex' }}>
                <span style={{ color: config.ctaTextColor, fontSize: '13px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{cta.toUpperCase()}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: urlColor, textDecoration: 'underline' }}>pruxin.com/clara</span>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 628 }
    );
  } catch (err) {
    return new Response('Error: ' + err.message, { status: 500 });
  }
}
