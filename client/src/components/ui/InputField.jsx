import { useState } from 'react';

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeClosed = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

export const InputField = ({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete }) => {
  const [show, setShow] = useState(false);
  const isPwd = type === 'password';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={name} style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-steel)', letterSpacing: '0.02em' }}>
          {label}
        </label>
      )}
      <div className={`field-wrap ${error ? 'error' : ''}`}>
        <input
          id={name}
          name={name}
          type={isPwd ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`field-input ${isPwd ? 'pr-12' : ''}`}
          aria-invalid={!!error}
        />
        {isPwd && (
          <button type="button" className="field-eye" onClick={() => setShow(p => !p)} tabIndex={-1} aria-label={show ? 'Hide' : 'Show'}>
            {show ? <EyeClosed /> : <EyeOpen />}
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: '0.78rem', color: 'var(--color-ember)', marginTop: 2 }}>{error}</p>}
    </div>
  );
};
