import React from 'react';
import { RefreshCcw, Sparkles, Minimize2, Maximize2, Trash2 } from 'lucide-react';
import ExportToPNGButton from './ExportToPNGButton';

const ToolbarIconButton = ({ onClick, icon: Icon, label, disabled = false }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={label}
        aria-label={label}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-slate-200/90 bg-white/95 text-slate-600 shadow-sm hover:text-sky-600 hover:border-sky-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
        <Icon className="w-3.5 h-3.5" />
    </button>
);

const AIVisualToolbar = ({ collapsed, loading, onToggleCollapse, onRegenerate, onSimplify, onDownload, onRemove }) => (
    <div className="absolute right-1.5 top-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-150">
        <ToolbarIconButton
            onClick={onToggleCollapse}
            icon={collapsed ? Maximize2 : Minimize2}
            label={collapsed ? 'Expand' : 'Collapse'}
        />
        <ToolbarIconButton onClick={onRegenerate} icon={RefreshCcw} label="Regenerate" disabled={loading} />
        <ToolbarIconButton onClick={onSimplify} icon={Sparkles} label="Simplify" disabled={loading} />
        <ExportToPNGButton onClick={onDownload} disabled={collapsed} />
        <ToolbarIconButton onClick={onRemove} icon={Trash2} label="Remove" />
    </div>
);

export default AIVisualToolbar;
