const Badge = ({ type }: { type: string }) => {
  const badges: { [key: string]: { bg: string; text: string; icon: string } } = {
    click: { bg: '#DDD6FE', text: '#4338CA', icon: '🖱️' },
    view: { bg: '#DBEAFE', text: '#0369A1', icon: '👁️' },
    submit: { bg: '#D1FAE5', text: '#065F46', icon: '✓' },
    error: { bg: '#FEE2E2', text: '#7F1D1D', icon: '⚠️' },
    load: { bg: '#FEF3C7', text: '#78350F', icon: '⚡' },
  };
  const badge = badges[type] || badges.click;
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
      <span>{badge.icon}</span>
      {type}
    </span>
  );
};

export default Badge;