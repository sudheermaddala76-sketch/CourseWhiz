import React, { useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import DiagramCard from './diagram/DiagramCard';

const PdfViewerTab = ({ pdfFilename, diagramItems, onRegenerateDiagram, onSimplifyDiagram, onRemoveDiagram, onToggleCollapseDiagram }) => {
    const [hasError, setHasError] = useState(false);
    const pdfDiagrams = diagramItems.filter((item) => item.anchorId === 'pdf-root');

    if (!pdfFilename) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-12 text-center bg-secondary/30 rounded-2xl border border-gray-800/50">
                <FileText className="w-16 h-16 text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No PDF Available</h3>
                <p className="text-gray-500 max-w-sm">
                    This course was created without a PDF or from plain text. You can only view documents that were uploaded as PDFs during course creation.
                </p>
            </div>
        );
    }

    const fileUrl = `https://coursewhiz-backend-xt2i.onrender.com/uploads/${pdfFilename}`;

    return (
        <div data-selection-context="true" data-diagram-anchor-id="pdf-root" className="flex flex-col h-full bg-secondary rounded-xl overflow-hidden shadow-inner border border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-background/30 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-900/30 text-cyan-400 rounded-lg">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-white font-medium">Source Document</h3>
                        <p className="text-xs text-gray-400">PDF Viewer</p>
                    </div>
                </div>
                
                <a 
                    href={fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors text-sm font-medium border border-gray-700"
                >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in New Tab
                </a>
            </div>

            <div className="flex-1 bg-gray-950 relative">
                {hasError ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <p className="text-red-400 font-medium mb-3">Failed to load the PDF.</p>
                        <p className="text-gray-500 text-sm mb-6">The file might have been moved or deleted from the server.</p>
                        <a 
                            href={fileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
                        >
                            Try Direct Link
                        </a>
                    </div>
                ) : (
                    <object 
                        data={fileUrl} 
                        type="application/pdf" 
                        className="w-full h-full"
                        onError={() => setHasError(true)}
                    >
                        {/* Fallback for browsers that don't support inline PDFs */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            <p className="text-gray-300 font-medium mb-3">Your browser does not support inline PDFs.</p>
                            <a 
                                href={fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors font-medium"
                            >
                                Download PDF
                            </a>
                        </div>
                    </object>
                )}
            </div>
            {pdfDiagrams.length > 0 && (
                <div className="border-t border-gray-800 px-3 py-2 bg-background/50">
                    <div className="space-y-2 w-full max-w-[650px] mx-auto">
                        {pdfDiagrams.map((item) => (
                            <DiagramCard
                                key={item.id}
                                item={item}
                                onRegenerate={onRegenerateDiagram}
                                onSimplify={onSimplifyDiagram}
                                onRemove={onRemoveDiagram}
                                onToggleCollapse={onToggleCollapseDiagram}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfViewerTab;
