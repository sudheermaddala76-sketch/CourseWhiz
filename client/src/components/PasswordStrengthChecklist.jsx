import React from 'react';

export const getPasswordStrengthChecks = (password = '') => [
  {
    label: 'At least 8 characters',
    met: password.length >= 8,
  },
  {
    label: 'One lowercase letter',
    met: /[a-z]/.test(password),
  },
  {
    label: 'One uppercase letter',
    met: /[A-Z]/.test(password),
  },
  {
    label: 'One number',
    met: /\d/.test(password),
  },
  {
    label: 'One special character',
    met: /[^A-Za-z0-9]/.test(password),
  },
];

const PasswordStrengthChecklist = ({ password = '' }) => {
  const checks = getPasswordStrengthChecks(password);

  return (
    <div className="mt-3 space-y-2.5 rounded-xl border border-gray-800 bg-gray-950/60 p-3">
      {checks.map(({ label, met }) => (
        <div
          key={label}
          className={`flex items-center gap-2 text-sm ${met ? 'text-green-400' : 'text-red-400'}`}
        >
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${met ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {met ? '✓' : '✕'}
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrengthChecklist;
