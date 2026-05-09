import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DiagramLoader = () => (
    <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-cyan-400/20 bg-slate-900/70 backdrop-blur-xl p-4 shadow-[0_12px_30px_rgba(2,8,23,0.45)]"
    >
        <div className="flex items-center gap-2 text-sm text-slate-300">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
            Generating diagram...
        </div>
    </motion.div>
);

export default DiagramLoader;
