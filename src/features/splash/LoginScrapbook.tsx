import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import { useUiStore } from '@/store/uiStore';
import './login.css';

const DESIGN_W = 1024;
const DESIGN_H = 641;
const STAGE_H = 608;
const FOOTER_H = 38;
const COVER_FADE_MS = 6000;

const COVERS = [
  { src: 'login-lobby-carousel-1.png', alt: '狗狗公司城市大廳' },
  { src: 'login-lobby-carousel-2.png', alt: '狗狗公司辦公室團隊合照' },
  { src: 'login-lobby-carousel-3.png', alt: '狗狗公司工作室日常' },
  { src: 'login-lobby-carousel-4.png', alt: '狗狗公司溫暖大廳自拍' },
];

type Props = {
  base: string;
  children: ReactNode;
};

export function LoginScrapbook({ base, children }: Props) {
  const openCredits = useUiStore((s) => s.openCredits);
  const [coverErrors, setCoverErrors] = useState<Set<number>>(() => new Set());
  const [coverIdx, setCoverIdx] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const livingCount = COVERS.length - coverErrors.size;
  const allDead = livingCount === 0;

  useEffect(() => {
    if (livingCount <= 1) return;
    const t = setInterval(() => {
      setCoverIdx((current) => {
        for (let step = 1; step <= COVERS.length; step++) {
          const next = (current + step) % COVERS.length;
          if (!coverErrors.has(next)) return next;
        }
        return current;
      });
    }, COVER_FADE_MS);
    return () => clearInterval(t);
  }, [livingCount, coverErrors]);

  useEffect(() => {
    if (!coverErrors.has(coverIdx) || allDead) return;
    for (let step = 1; step <= COVERS.length; step++) {
      const next = (coverIdx + step) % COVERS.length;
      if (!coverErrors.has(next)) {
        setCoverIdx(next);
        return;
      }
    }
  }, [coverErrors, coverIdx, allDead]);

  useEffect(() => {
    function updateScale() {
      const stage = stageRef.current;
      if (!stage) return;
      if (window.innerWidth < 1024) {
        stage.style.removeProperty('--login-scale');
        return;
      }
      const sx = window.innerWidth / DESIGN_W;
      const sy = Math.max(0.1, (window.innerHeight - FOOTER_H) / DESIGN_H);
      const scale = Math.min(sx, sy);
      const stageTop = Math.max(10, (window.innerHeight - FOOTER_H - STAGE_H * scale) / 2);
      stage.style.setProperty('--login-scale', String(scale));
      stage.style.setProperty('--login-stage-top', `${stageTop}px`);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="login-scrapbook relative h-screen w-full overflow-hidden">
      <div className="login-scrapbook-bg absolute inset-0" />

      <div ref={stageRef} className="login-scaled-stage">
        <BackgroundDecor />
        <header className="login-scrapbook-header relative z-10 flex items-center px-6 md:px-12 h-[78px]">
          <div className="login-brand inline-flex items-center">
            <button
              type="button"
              className="login-brand-button"
              onClick={openCredits}
              aria-label="查看製作人員名單"
              title="製作人員名單"
            >
              <img
                className="login-brand-logo"
                src={`${base}assets/login/dogoffice-pawtopia-logo.png`}
                alt="狗狗公司 Pawtopia"
                width={150}
                height={92}
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            </button>
          </div>
        </header>

        <main className="login-scrapbook-main relative z-10 grid items-stretch px-6 md:px-12">
          <section className="login-photo-stage relative flex items-center justify-center">
            <div className="login-polaroid">
              <span className="login-tape login-tape-l" aria-hidden />
              <span className="login-tape login-tape-r" aria-hidden />
              <span className="login-polaroid-sticky login-polaroid-sticky-br" aria-hidden>
                <strong>♥</strong>
                忘記密碼？試試 Google 登入
              </span>
              <div className="login-polaroid-photo">
                {allDead ? (
                  <div className="login-polaroid-fallback">
                    <span>📸</span>
                    <p>Paw-der Games</p>
                    <small>相片即將上線</small>
                  </div>
                ) : (
                  COVERS.map((cover, i) => (
                    <img
                      key={cover.src}
                      className="login-polaroid-cover"
                      src={`${base}assets/login/${cover.src}`}
                      alt={cover.alt}
                      data-active={i === coverIdx ? 'true' : 'false'}
                      data-dead={coverErrors.has(i) ? 'true' : 'false'}
                      onError={() =>
                        setCoverErrors((prev) => {
                          if (prev.has(i)) return prev;
                          const next = new Set(prev);
                          next.add(i);
                          return next;
                        })
                      }
                      loading={i === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                    />
                  ))
                )}
                <span className="login-photo-title">
                  Paw-<wbr />der<br />Games
                </span>
              </div>
              <span className="login-season-badge" aria-hidden>
                <strong>NEW</strong>
                <span>S2</span>
                <small>賽季開放</small>
              </span>
              <div className="login-polaroid-caption">
                <span className="login-caption-heart" aria-hidden>♥</span>
                <span className="login-caption-text">
                  <strong>可愛又療癒的狗狗經營小遊戲</strong>
                  <small>招狗・訓狗・搬辦公室・開分店</small>
                </span>
              </div>
            </div>
          </section>

          <section className="login-card-stage relative flex items-stretch justify-center">
            <span className="login-card-tape login-card-tape-l" aria-hidden />
            <span className="login-card-tape login-card-tape-r" aria-hidden />
            <span className="login-card-tape login-card-tape-b" aria-hidden />
            <div className="login-card">
              {children}
            </div>
          </section>
        </main>
      </div>

      <footer className="login-scrapbook-footer z-30 px-6 md:px-12 flex items-center justify-center gap-3 md:gap-5 text-xs md:text-sm">
        <span className="login-footer-copyright">© 2026 Doggo Corp</span>
        <span className="login-footer-dot" aria-hidden>•</span>
        <FooterLink label="使用條款" />
        <span className="login-footer-dot" aria-hidden>•</span>
        <FooterLink label="隱私政策" />
        <span className="login-footer-dot" aria-hidden>•</span>
        <span className="login-footer-version">
          <SvgIcon name="paw" size={24} />
          v{__APP_VERSION__}
        </span>
      </footer>
    </div>
  );
}

function BackgroundDecor() {
  return (
    <div className="login-bg-decor" aria-hidden>
      <span className="login-bg-tape login-bg-tape-2" />
      <span className="login-bg-tape login-bg-tape-3" />
      <span className="login-bg-tape login-bg-tape-4" />
      <span className="login-bg-tape login-bg-tape-5" />
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="login-footer-link"
      onClick={() => {
        // eslint-disable-next-line no-alert
        alert(`${label}準備中`);
      }}
    >
      {label}
    </button>
  );
}

