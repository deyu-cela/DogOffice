import { useEffect, useRef, useState, type ReactNode } from 'react';
import { SvgIcon } from '@/components/SvgIcon';
import './login.css';

const DESIGN_W = 1024;
const DESIGN_H = 641;
const STAGE_H = 608;
const FOOTER_H = 38;

type Props = {
  base: string;
  children: ReactNode;
};

export function LoginScrapbook({ base, children }: Props) {
  const [coverError, setCoverError] = useState(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const coverSrc = `${base}assets/login/paw-der-games-cover.jpg`;

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
            <img
              className="login-brand-logo"
              src={`${base}assets/login/dogoffice-pawtopia-logo.png`}
              alt="狗狗公司 Pawtopia"
              width={150}
              height={92}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
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
                {coverError ? (
                  <div className="login-polaroid-fallback">
                    <span>📸</span>
                    <p>Paw-der Games</p>
                    <small>相片即將上線</small>
                  </div>
                ) : (
                  <img
                    src={coverSrc}
                    alt="Paw-der Games 狗狗公司辦公室合照"
                    onError={() => setCoverError(true)}
                    loading="eager"
                    decoding="async"
                  />
                )}
                <span className="login-photo-title">
                  Paw-<wbr />der<br />Games
                </span>
                <span className="login-season-badge" aria-hidden>
                  <strong>NEW</strong>
                  <span>S2</span>
                  <small>賽季開放</small>
                </span>
              </div>
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
          <SvgIcon name="appDog" size={14} />
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

