import type { EventType } from "../types/telemetry";

 

const Badge = ({ type }: { type: EventType }) => {
    const badges: { [key in EventType]: { bg: string; text: string; icon: React.ReactNode } } = {
      request: { 
        bg: '#DDD6FE', 
        text: '#4338CA',
        icon: (
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      },
      error: { 
        bg: '#FEE2E2', 
        text: '#7F1D1D',
        icon: (
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
        )
      },
      warning: { 
        bg: '#FEF3C7', 
        text: '#78350F',
        icon: (
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
        )
      },
      metric: { 
        bg: '#DBEAFE', 
        text: '#0369A1',
        icon: (
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4-1h2v19h-2zm4 4h2v15h-2z" />
          </svg>
        )
      },
      trace: { 
        bg: '#D1FAE5', 
        text: '#065F46',
        icon: (
          <svg style={{ width: 14, height: 14 }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 17H7v-7h2V17zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
          </svg>
        )
      },
    };
    const badge = badges[type];
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: badge.bg,
          color: badge.text,
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          textTransform: 'capitalize',
        }}
      >
        {badge.icon}
        {type}
      </span>
    );
  };

  export default Badge;