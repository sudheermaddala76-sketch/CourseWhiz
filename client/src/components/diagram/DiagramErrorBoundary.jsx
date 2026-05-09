import React from 'react';
import { AlertTriangle } from 'lucide-react';

class DiagramErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error('Diagram render error:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-sm text-red-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Diagram failed to render.
                </div>
            );
        }

        return this.props.children;
    }
}

export default DiagramErrorBoundary;
