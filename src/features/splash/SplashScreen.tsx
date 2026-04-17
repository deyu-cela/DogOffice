import { useGameStore } from '@/store/gameStore';

export function SplashScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const base = import.meta.env.BASE_URL;

  return (
    <div
      className="fixed inset-0 z-[1000] flex flex-col items-center justify-center text-center p-8"
      style={{
        backgroundImage: `linear-gradient(rgba(255,245,230,0.78), rgba(255,245,230,0.88)), url('${base}assets/start-screen.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="text-6xl font-extrabold mb-3 drop-shadow-lg" style={{ color: '#5b3c2b' }}>
        🐕 狗狗公司
      </div>
      <div className="text-xl mb-8" style={{ color: '#7a685a' }}>
        可愛又療癒的狗狗經營小遊戲
      </div>
      <button
        onClick={startGame}
        className="px-12 py-4 text-2xl rounded-full font-extrabold"
        style={{
          background: 'linear-gradient(180deg, #ffcf6b, #ff9f43)',
          color: 'white',
          boxShadow: '0 8px 24px rgba(255,159,67,0.4)',
        }}
      >
        開始經營
      </button>
    </div>
  );
}
