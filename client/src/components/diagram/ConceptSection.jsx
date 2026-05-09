import React from 'react';
import {
    Target,
    BarChart3,
    Users,
    Lightbulb,
    Sparkles,
    Layers,
    Clock3,
    Workflow,
    Rocket
} from 'lucide-react';

const iconMap = {
    target: Target,
    chart: BarChart3,
    users: Users,
    idea: Lightbulb,
    sparkles: Sparkles,
    layers: Layers,
    timeline: Clock3,
    process: Workflow,
    growth: Rocket
};

const colorMap = {
    yellow: 'bg-amber-50/50 border-amber-100 text-amber-700',
    orange: 'bg-orange-50/50 border-orange-100 text-orange-700',
    red: 'bg-rose-50/50 border-rose-100 text-rose-700',
    blue: 'bg-sky-50/50 border-sky-100 text-sky-700',
    green: 'bg-emerald-50/50 border-emerald-100 text-emerald-700',
    purple: 'bg-violet-50/50 border-violet-100 text-violet-700',
    pink: 'bg-pink-50/50 border-pink-100 text-pink-700'
};

const ConceptSection = ({ section }) => {
    const Icon = iconMap[section.icon] || Sparkles;
    const colorClass = colorMap[section.color] || colorMap.blue;

    return (
        <div className={`rounded-md border px-2.5 py-2 ${colorClass}`}>
            <div className="flex items-start gap-2">
                <div className="rounded-md bg-white/85 p-1 border border-white">
                    <Icon className="w-3 h-3" />
                </div>
                <div>
                    <h4 className="text-xs font-semibold text-slate-900">{section.label}</h4>
                    <p className="mt-0.5 text-xs leading-snug text-slate-700">{section.content}</p>
                </div>
            </div>
        </div>
    );
};

export default ConceptSection;
