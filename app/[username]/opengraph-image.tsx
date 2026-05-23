import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MyLink Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Satori가 지원하지 않는 요소(blur)를 단순 불투명 원으로 대체 */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '800px',
            height: '800px',
            backgroundColor: '#e9d5ff',
            borderRadius: '400px',
            opacity: 0.3,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '800px',
            height: '800px',
            backgroundColor: '#bfdbfe',
            borderRadius: '400px',
            opacity: 0.3,
          }}
        />

        {/* Profile Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #e9d5ff',
            borderRadius: '48px',
            padding: '70px 120px',
            boxShadow: '0 20px 25px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Avatar Placeholder */}
          <div
            style={{
              width: '160px',
              height: '160px',
              borderRadius: '80px',
              backgroundColor: '#a855f7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '32px',
            }}
          >
            <span style={{ fontSize: '72px', color: '#fff', fontWeight: 800 }}>
              {username.charAt(0).toUpperCase()}
            </span>
          </div>
          
          <h1
            style={{
              fontSize: '68px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.04em',
            }}
          >
            @{username}
          </h1>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '32px',
              backgroundColor: '#f8fafc',
              border: '2px solid #e2e8f0',
              padding: '14px 28px',
              borderRadius: '50px',
            }}
          >
            <p
              style={{
                fontSize: '26px',
                fontWeight: 800,
                color: '#64748b',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              MyLink 프로필 방문하기
            </p>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
