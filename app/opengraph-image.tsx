import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'MyLink - 당신의 모든 콘텐츠를 단 하나의 링크로.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          backgroundColor: '#f8fafc',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'sans-serif',
        }}
      >
        {/* 단순한 원형 배경 장식 (Satori 지원 안하는 blur 제거) */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '600px',
            height: '600px',
            backgroundColor: '#e9d5ff', // 연한 보라색 (purple-200)
            borderRadius: '300px',
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '10%',
            width: '700px',
            height: '700px',
            backgroundColor: '#fbcfe8', // 연한 핑크색 (pink-200)
            borderRadius: '350px',
            opacity: 0.5,
          }}
        />

        {/* 메인 컨텐츠 영역 */}
        <div style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', padding: '0 80px' }}>
          
          {/* 왼쪽: 텍스트 영역 */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1.1 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3e8ff',
                padding: '12px 24px',
                borderRadius: '50px',
                marginBottom: '28px',
                border: '2px solid #d8b4fe',
              }}
            >
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#7e22ce' }}>
                나만의 프로필 링크
              </span>
            </div>

            <h1
              style={{
                fontSize: '68px',
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.1,
                margin: 0,
                letterSpacing: '-0.04em',
              }}
            >
              당신의 모든 콘텐츠를
            </h1>
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 800,
                lineHeight: 1.1,
                margin: 0,
                marginTop: '12px',
                letterSpacing: '-0.04em',
                color: '#9333ea', // 단일 보라색
              }}
            >
              단 하나의 링크로.
            </h1>
            <p
              style={{
                fontSize: '28px',
                fontWeight: 600,
                color: '#475569',
                marginTop: '36px',
                marginBottom: 0,
                lineHeight: 1.5,
              }}
            >
              인스타그램, 유튜브, 블로그.<br />여러 곳에 흩어진 나의 기록들을<br />하나의 페이지에 모아보세요.
            </p>
            
            {/* 하단 로고 */}
            <div style={{ marginTop: '56px', display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '56px', height: '56px', backgroundColor: '#9333ea', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: '28px' }}>M</span>
              </div>
              <span style={{ fontSize: '36px', fontWeight: 800, marginLeft: '16px', color: '#0f172a', letterSpacing: '-0.02em' }}>
                MyLink
              </span>
            </div>
          </div>

          {/* 오른쪽: 그래픽(스마트폰 모형) 영역 */}
          <div style={{ display: 'flex', flex: 0.9, justifyContent: 'flex-end', position: 'relative' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '360px',
                height: '660px',
                backgroundColor: '#ffffff',
                borderRadius: '44px',
                border: '12px solid #0f172a',
                boxShadow: '0 20px 25px rgba(0, 0, 0, 0.1)', // 단순 그림자
                position: 'absolute',
                top: '-15px',
                right: '0',
                padding: '24px',
              }}
            >
              {/* Notch */}
              <div style={{ position: 'absolute', top: '0px', left: '108px', width: '120px', height: '24px', backgroundColor: '#0f172a', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }} />

              {/* Profile Avatar & Name */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '48px' }}>
                <div style={{ width: '88px', height: '88px', borderRadius: '44px', backgroundColor: '#d8b4fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '40px', fontWeight: 800, color: 'white' }}>M</span>
                </div>
                <div style={{ width: '130px', height: '16px', backgroundColor: '#e2e8f0', borderRadius: '8px', marginTop: '20px' }} />
                <div style={{ width: '70px', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', marginTop: '12px' }} />
              </div>

              {/* Link Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', marginTop: '48px', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '56px', backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0 16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fee2e2' }} />
                  <div style={{ marginLeft: '12px', width: '50%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '56px', backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0 16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#dbeafe' }} />
                  <div style={{ marginLeft: '12px', width: '65%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', height: '56px', backgroundColor: '#ffffff', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '0 16px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#fce7f3' }} />
                  <div style={{ marginLeft: '12px', width: '45%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '5px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
