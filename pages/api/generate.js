import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  
  const industry = searchParams.get('industry') || 'accountants';
  const theme = searchParams.get('theme') || 'dark';
  const headline = searchParams.get('headline') || 'Your next client just called.';
  const subheadline = searchParams.get('subheadline') || 'Nobody answered.';
  const painstat = searchParams.get('painstat') || '62% of callers never call back.';
  const cta = searchParams.get('cta') || 'Book a Demo';
  const bgImageUrl = searchParams.get('bgImageUrl');

  // Fetch background image and convert to base64
  let bgBase64 = null;
  if (bgImageUrl) {
    try {
      const imgRes = await fetch(bgImageUrl);
      const arrayBuffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      bgBase64 = `data:${contentType};base64,${base64}`;
    } catch (e) {
      bgBase64 = null;
    }
  }

  const isDark = theme === 'dark';
  const bg = isDark ? '#07091A' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#1A1A2E';
  const accent = '#C9A84C';
  const statColor = isDark ? '#C9A84C' : '#B98D10';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '628px',
          display: 'flex',
          fontFamily: 'sans-serif',
          backgroundColor: bg,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background image - right half */}
        {bgBase64 && (
          <img
            src={bgBase64}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '55%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            width: '55%',
            height: '100%',
            background: isDark
              ? 'linear-gradient(to right, #07091A 0%, transparent 60%)'
              : 'linear-gradient(to right, #FFFFFF 0%, transparent 60%)',
            display: 'flex',
          }}
        />

        {/* Left content */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '60%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
          }}
        >
          {/* Industry pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <div
              style={{
                backgroundColor: accent,
                color: '#000000',
                fontSize: '13px',
                fontWeight: 'bold',
                padding: '6px 16px',
                borderRadius: '20px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {industry.toUpperCase()}
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: textColor,
              lineHeight: 1.1,
              marginBottom: '16px',
              maxWidth: '560px',
            }}
          >
            {headline}
          </div>

          {/* Subheadline */}
          <div
            style={{
              fontSize: '20px',
              color: isDark ? '#AAAACC' : '#555577',
              marginBottom: '24px',
              maxWidth: '500px',
              lineHeight: 1.4,
            }}
          >
            {subheadline}
          </div>

          {/* Pain stat */}
          <div
            style={{
              fontSize: '16px',
              color: statColor,
              fontWeight: 'bold',
              marginBottom: '32px',
            }}
          >
            {painstat}
          </div>

          {/* CTA + URL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div
              style={{
                backgroundColor: accent,
                color: '#000000',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '14px 28px',
                borderRadius: '8px',
              }}
            >
              {cta}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: isDark ? '#8888AA' : '#9999BB',
              }}
            >
              pruxin.com/clara
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 628,
    }
  );
}
