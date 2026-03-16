import React, { useEffect, useState } from 'react';
import { FileText, File, FileCode2, Book, GraduationCap } from 'lucide-react';

const icons = [FileText, File, FileCode2, Book, GraduationCap];

const FallingPapers = () => {
    const [papers, setPapers] = useState([]);

    useEffect(() => {
        const paperCount = 20;
        const newPapers = Array.from({ length: paperCount }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}vw`,
            animationDuration: `${12 + Math.random() * 18}s`,
            animationDelay: `-${Math.random() * 30}s`,
            opacity: 0.05 + Math.random() * 0.15,
            size: 20 + Math.random() * 30,
            Icon: icons[Math.floor(Math.random() * icons.length)],
            rotationStart: Math.random() * 360,
            rotationEnd: Math.random() * 720 + 360
        }));
        setPapers(newPapers);
    }, []);

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            {papers.map((paper) => {
                const Icon = paper.Icon;
                return (
                    <div
                        key={paper.id}
                        className="absolute top-[-10%] text-white falling-paper"
                        style={{
                            left: paper.left,
                            opacity: paper.opacity,
                            animationDuration: paper.animationDuration,
                            animationDelay: paper.animationDelay,
                            '--rotation-start': `${paper.rotationStart}deg`,
                            '--rotation-end': `${paper.rotationEnd}deg`
                        }}
                    >
                        <Icon size={paper.size} strokeWidth={1.5} />
                    </div>
                );
            })}
        </div>
    );
};

export default FallingPapers;
