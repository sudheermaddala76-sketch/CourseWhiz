import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import AIVisualToolbar from './AIVisualToolbar';
import DiagramErrorBoundary from './DiagramErrorBoundary';
import InlineInfographic from './InlineInfographic';

const DiagramCanvas = ({ item, onRegenerate, onSimplify, onRemove, onToggleCollapse }) => {
    const wrapperRef = useRef(null);

    const handleDownload = async () => {
        if (!wrapperRef.current) return;
        try {
            const dataUrl = await toPng(wrapperRef.current, {
                cacheBust: true,
                backgroundColor: '#f8fafc',
                pixelRatio: 2
            });
            const link = document.createElement('a');
            link.download = `${item.id}-visual-summary.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Download visual failed', error);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="group relative max-w-[650px] mx-auto"
        >
            <AIVisualToolbar
                collapsed={item.collapsed}
                loading={item.loading}
                onToggleCollapse={() => onToggleCollapse(item.id)}
                onRegenerate={() => onRegenerate(item.id)}
                onSimplify={() => onSimplify(item.id)}
                onDownload={handleDownload}
                onRemove={() => onRemove(item.id)}
            />
            {item.loading && (
                <div className="px-0.5 pb-1 text-[10px] text-slate-500">
                    <Loader2 className="inline-block w-3 h-3 mr-1 animate-spin text-sky-600" />
                    Generating visual...
                </div>
            )}

            {!item.collapsed && (
                <div ref={wrapperRef} className="p-0">
                    {item.diagram ? (
                        <InlineInfographic visual={item.diagram} />
                    ) : (
                        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                            Building a visual summary...
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

const DiagramCard = (props) => (
    <DiagramErrorBoundary>
        <DiagramCanvas {...props} />
    </DiagramErrorBoundary>
);

export default DiagramCard;
