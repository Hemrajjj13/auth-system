import { useRef } from 'react';

/**
 * Six individual digit boxes.
 * - Auto-focuses next box on input
 * - Backspace moves to previous box
 * - Paste fills all boxes
 */
export const OTPInput = ({ value, onChange, disabled }) => {
  const refs = useRef([]);
  const digits = (value || '      ').split('').slice(0, 6);

  const update = (arr) => onChange(arr.join(''));

  const handleKey = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const arr = [...digits];
      if (arr[idx] && arr[idx] !== ' ') {
        arr[idx] = ' ';
        update(arr);
      } else if (idx > 0) {
        arr[idx - 1] = ' ';
        update(arr);
        refs.current[idx - 1]?.focus();
      }
    }
  };

  const handleChange = (idx, e) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1);
    if (!ch) return;
    const arr = [...digits];
    arr[idx] = ch;
    update(arr);
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const arr = pasted.split('').concat(Array(6).fill(' ')).slice(0, 6);
    update(arr);
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="otp-grid">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d === ' ' ? '' : d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`otp-box ${d !== ' ' ? 'filled' : ''}`}
          aria-label={`Digit ${i + 1}`}
        />
      ))}
    </div>
  );
};
