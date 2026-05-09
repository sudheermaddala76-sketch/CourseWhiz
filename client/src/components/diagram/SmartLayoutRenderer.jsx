import React from 'react';
import ConceptSection from './ConceptSection';

const layoutClasses = {
    infographic: 'grid grid-cols-1 gap-1.5',
    comparison: 'grid grid-cols-1 md:grid-cols-2 gap-1.5',
    'step-by-step': 'grid grid-cols-1 gap-1.5',
    hierarchy: 'grid grid-cols-1 md:grid-cols-2 gap-1.5',
    'concept-summary': 'grid grid-cols-1 gap-1.5',
    timeline: 'grid grid-cols-1 gap-1.5',
    process: 'grid grid-cols-1 gap-1.5'
};

const SmartLayoutRenderer = ({ visual }) => {
    const className = layoutClasses[visual.layout] || layoutClasses.infographic;
    return (
        <div className={className}>
            {visual.sections.map((section, index) => (
                <ConceptSection key={`${section.label}-${index}`} section={section} />
            ))}
        </div>
    );
};

export default SmartLayoutRenderer;
