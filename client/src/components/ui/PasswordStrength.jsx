const levels = [
  { label: '', color: '' },
  { label: 'Weak',   color: '#d33f49' },
  { label: 'Fair',   color: '#e07b1a' },
  { label: 'Good',   color: '#c9a227' },
  { label: 'Strong', color: '#34d399' },
];

const score = (pwd) => {
  let s = 0;
  if (pwd.length >= 6)  s++;
  if (pwd.length >= 10) s++;
  if (/[A-Z]/.test(pwd)) s++;
  if (/\d/.test(pwd))    s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return Math.min(s, 4);
};

export const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const lvl = score(password);
  const { label, color } = levels[lvl];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
      <div className="strength-bars" style={{ flex: 1 }}>
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="strength-bar"
            style={{ background: lvl >= n ? color : undefined }}
          />
        ))}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color, minWidth: 38, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
        {label}
      </span>
    </div>
  );
};
