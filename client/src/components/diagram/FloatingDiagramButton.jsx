import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WandSparkles } from 'lucide-react';

const FloatingDiagramButton = ({ visible, x, y, onClick }) => (
    <AnimatePresence>
        {visible && (
            <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.16 }}
                onClick={onClick}
                style={{ left: x, top: y }}
                className="fixed z-[60] inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-slate-900/90 px-3 py-2 text-xs font-medium text-cyan-100 shadow-[0_10px_24px_rgba(6,182,212,0.18)] backdrop-blur-md hover:bg-slate-800 transition-colors"
            >
                <WandSparkles className="w-3.5 h-3.5 text-cyan-300" />
                Generate Visual
            </motion.button>
        )}
    </AnimatePresence>
);

export default FloatingDiagramButton;
