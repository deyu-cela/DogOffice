import type { GachaResult } from '@/store/gameStore';
import { dogStarStyle } from './gachaStyles';
import { DogAvatar } from '@/components/DogAvatar';

type Props = {
  result: GachaResult;
  revealed: boolean;
  flyDelay: number; // 秒
  onReveal: () => void;
  size?: number; // 卡片寬度 px，預設 120
};

export function GachaCard({ result, revealed, flyDelay, onReveal, size = 120 }: Props) {
  const star = dogStarStyle(result.dog);
  const dog = result.dog;
  const height = size * 1.45;

  const stars = '★'.repeat(star.tier);

  return (
    <div
      className="gacha-card-wrap"
      style={{
        width: size,
        height: height,
        animationDelay: `${flyDelay}s`,
      }}
    >
      <button
        type="button"
        className={`gacha-card ${revealed ? 'revealed' : ''}`}
        onClick={revealed ? undefined : onReveal}
        style={{
          width: size,
          height: height,
          cursor: revealed ? 'default' : 'pointer',
        }}
      >
        {/* 卡背 */}
        <div
          className="gacha-card-face gacha-card-back"
          style={{
            background: 'linear-gradient(180deg, #fffdfb 0%, #ffe8e9 100%)',
            border: '2px dashed rgba(214,145,150,0.58)',
            boxShadow: `0 8px 18px rgba(166,91,85,0.18), 0 0 16px ${star.glow}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 6,
              border: '1.5px dashed rgba(214,145,150,0.34)',
              borderRadius: 8,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              fontSize: size * 0.36,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.25))',
            }}
          >
            🐾
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#886153',
              fontSize: 10,
              letterSpacing: 2,
              fontWeight: 800,
            }}
          >
            DOGS
          </div>
        </div>

        {/* 卡正面 */}
        <div
          className="gacha-card-face gacha-card-front"
          style={{
            background: `linear-gradient(180deg, ${star.bgFrom} 0%, ${star.bgTo} 100%)`,
            border: `2px solid ${star.border}`,
            boxShadow: `0 8px 18px rgba(166,91,85,0.18), 0 0 18px ${star.glow}`,
          }}
        >
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              minHeight: 0,
            }}
          >
            {dog.image ? (
              <img
                src={dog.image}
                alt={dog.name}
                draggable={false}
                style={{
                  maxWidth: '85%',
                  maxHeight: '85%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.18))',
                }}
              />
            ) : (
              <DogAvatar role={dog.role} breed={dog.breed} size={size * 0.7} />
            )}
          </div>
          <div
            style={{
              width: '100%',
              padding: '4px 6px 6px',
              background: 'rgba(255,255,255,0.85)',
              borderTop: `1px solid ${star.border}`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: star.border,
                fontWeight: 800,
                letterSpacing: 1,
                lineHeight: 1,
              }}
            >
              {stars}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 900,
                color: '#173b78',
                lineHeight: 1.2,
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {dog.name}
            </div>
            <div
              style={{
                fontSize: 9,
                color: '#6d82a8',
                lineHeight: 1,
                marginTop: 1,
              }}
            >
              {dog.role}
            </div>
          </div>

          {result.duplicate && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontSize: 9,
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.92)',
                color: '#1c4f8a',
                border: '1px solid #5fa0e8',
              }}
            >
              {result.breakthroughGained > 0 ? `✨突破+${result.breakthroughGained}` : `+$${result.refunded}`}
            </div>
          )}
          {!result.duplicate && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                fontSize: 9,
                fontWeight: 800,
                padding: '2px 5px',
                borderRadius: 4,
                background: '#29b98f',
                color: 'white',
              }}
            >
              NEW
            </div>
          )}
        </div>
      </button>
    </div>
  );
}
