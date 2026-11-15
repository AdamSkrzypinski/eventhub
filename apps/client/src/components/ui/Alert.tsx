import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
}

export const Alert: React.FC<AlertProps> = ({ type, message }) => {
  const isError = type === 'error';

  return (
    <div
      className={`p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
        isError
          ? 'bg-red-950/60 border-red-800 text-red-300'
          : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
      }`}
    >
      {isError ? (
        <AlertCircle className="w-5 h-5 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 shrink-0" />
      )}
      <span>{message}</span>
    </div>
  );
};