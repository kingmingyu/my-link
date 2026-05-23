import { ImageResponse } from 'next/og';
import { getUserByUsername } from '@/lib/user';

export const runtime = 'edge';

export const alt = 'MyLink Profile';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const resolvedParams = await params;
  const username = resolvedParams.username;
  
  // 1. 유저 정보 조회
  const userProfile = await getUserByUsername(username);
  
  const displayName = userProfile?.displayName || username;
  const bio = userProfile?.bio || '';
  const firstLetter = displayName.charAt(0).toUpperCase();

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
          backgroundColor: '#f8fafc',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* 배경 장식 도형들 (Satori 호환용 단순 원형 겹침) */}
        <div
          style={{
            position: 'absolute',
            top: '-30%',
            right: '-10%',
            width: '900px',
            height: '900px',
            backgroundColor: '#f3e8ff', // purple-100
            borderRadius: '450px',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-25%',
            left: '-15%',
            width: '800px',
            height: '800px',
            backgroundColor: '#e0e7ff', // indigo-100
            borderRadius: '400px',
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '15%',
            right: '15%',
            width: '240px',
            height: '240px',
            backgroundColor: '#fce7f3', // pink-100
            borderRadius: '120px',
            opacity: 0.8,
          }}
        />

        {/* 메인 프로필 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            border: '2px solid #e2e8f0', // slate-200
            borderRadius: '64px',
            padding: '70px 140px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.05)',
            zIndex: 10,
          }}
        >
          {/* 아바타 (첫 글자) */}
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '90px',
              backgroundColor: '#9333ea', // purple-600
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '36px',
              border: '8px solid #f3e8ff', // 테두리로 입체감
              boxShadow: '0 10px 20px rgba(147, 51, 234, 0.2)',
            }}
          >
            <span style={{ fontSize: '84px', color: '#fff', fontWeight: 800 }}>
              {firstLetter}
            </span>
          </div>
          
          {/* 표시 이름 (displayName) */}
          <h1
            style={{
              fontSize: '76px',
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.04em',
              textAlign: 'center',
            }}
          >
            {displayName}
          </h1>
          
          {/* 아이디 (@username) */}
          <p
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#94a3b8',
              margin: 0,
              marginTop: '12px',
              letterSpacing: '-0.02em',
            }}
          >
            @{username}
          </p>

          {/* 소개글 (bio) */}
          {bio && (
            <p
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#475569',
                marginTop: '36px',
                marginBottom: 0,
                textAlign: 'center',
                maxWidth: '640px',
                lineHeight: 1.5,
                letterSpacing: '-0.02em',
              }}
            >
              {bio}
            </p>
          )}
        </div>
        
        {/* 하단 MyLink 로고 */}
        <div style={{ position: 'absolute', bottom: '48px', display: 'flex', alignItems: 'center', zIndex: 10 }}>
          <div style={{ width: '44px', height: '44px', backgroundColor: '#9333ea', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '24px' }}>M</span>
          </div>
          <span style={{ fontSize: '28px', fontWeight: 800, marginLeft: '12px', color: '#0f172a', letterSpacing: '-0.02em' }}>
            MyLink
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
