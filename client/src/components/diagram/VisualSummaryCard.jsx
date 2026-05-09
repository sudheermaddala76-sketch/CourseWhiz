import React from 'react';
import { motion } from 'framer-motion';
import SmartLayoutRenderer from './SmartLayoutRenderer';

const VisualSummaryCard = ({ visual }) => (
    <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="rounded-lg border border-slate-200/80 bg-white px-2.5 py-2 shadow-[0_4px_12px_rgba(2,6,23,0.05)]"
    >
        <h3 className="text-[13px] font-semibold text-slate-900 tracking-tight mb-1.5">{visual.title}</h3>
        <SmartLayoutRenderer visual={visual} />
    </motion.div>
);

export default VisualSummaryCard;
