import React from 'react';
import { Download } from 'lucide-react';

const ExportToPNGButton = ({ onClick, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title="Export PNG"
        aria-label="Export PNG"
        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm hover:text-sky-600 hover:border-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        <Download className="w-3.5 h-3.5" />
    </button>
);

export default ExportToPNGButton;
