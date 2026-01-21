import type { EventType } from '../types/telemetry';

interface BadgeProps {
  type: EventType;
}

const BADGE_COLORS: Record<EventType, { bg: string; text: string }> = {
  request: { bg: '#d1ecf1', text: '#0c5460' },
  error: { bg: '#f8d7da', text: '#721c24' },
  warning: { bg: '#fff3cd', text: '#856404' },
  metric: { bg: '#d4edda', text: '#155724' },
  trace: { bg: '#e2e3e5', text: '#383d41' },
};

/**
 * Badge component for displaying event types with color coding
 */
export function Badge({ type }: BadgeProps) {
  const colors = BADGE_COLORS[type];

  return (
    <span
      className="badge"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
      }}
      role="status"
      aria-label={`Event type: ${type}`}
    >
      {type}
    </span>
  );
}