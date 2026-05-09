import React from 'react';
import VisualSummaryCard from './VisualSummaryCard';

const InlineInfographic = ({ visual }) => {
    if (!visual) return null;
    return <VisualSummaryCard visual={visual} />;
};

export default InlineInfographic;
