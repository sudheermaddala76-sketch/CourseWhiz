import React, { useCallback, useEffect, useState } from 'react';
import FloatingDiagramButton from './FloatingDiagramButton';

const MIN_SELECTION = 20;
const TARGET_SELECTOR = '[data-selection-context="true"]';
const ANCHOR_SELECTOR = '[data-diagram-anchor-id]';

const TextSelectionHandler = ({ onGenerate }) => {
    const [selectionState, setSelectionState] = useState({
        visible: false,
        text: '',
        anchorId: '',
        x: 0,
        y: 0
    });

    const hideButton = useCallback(() => {
        setSelectionState((prev) => ({ ...prev, visible: false }));
    }, []);

    useEffect(() => {
        const handleSelectionChange = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString()?.trim() || '';

            if (!selection || !selection.rangeCount || selectedText.length < MIN_SELECTION) {
                hideButton();
                return;
            }

            const range = selection.getRangeAt(0);
            const contextNode = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
                ? range.commonAncestorContainer.parentElement
                : range.commonAncestorContainer;

            if (!(contextNode instanceof Element)) {
                hideButton();
                return;
            }

            const contextContainer = contextNode.closest(TARGET_SELECTOR);
            const anchorElement = contextNode.closest(ANCHOR_SELECTOR);
            const anchorId = anchorElement?.getAttribute('data-diagram-anchor-id') || '';

            if (!contextContainer || !anchorId) {
                hideButton();
                return;
            }

            const rect = range.getBoundingClientRect();
            const buttonX = Math.min(Math.max(12, rect.left), window.innerWidth - 190);
            const buttonY = Math.min(window.innerHeight - 56, rect.bottom + 10);
            setSelectionState({
                visible: true,
                text: selectedText,
                anchorId,
                x: buttonX,
                y: buttonY
            });
        };

        const handleOutsideClick = (event) => {
            if (!(event.target instanceof Element)) return;
            if (event.target.closest('[data-floating-diagram-button]')) return;
            if (event.target.closest(TARGET_SELECTOR)) return;
            hideButton();
        };

        document.addEventListener('selectionchange', handleSelectionChange);
        document.addEventListener('mousedown', handleOutsideClick);
        window.addEventListener('scroll', hideButton, { passive: true });
        window.addEventListener('resize', hideButton);

        return () => {
            document.removeEventListener('selectionchange', handleSelectionChange);
            document.removeEventListener('mousedown', handleOutsideClick);
            window.removeEventListener('scroll', hideButton);
            window.removeEventListener('resize', hideButton);
        };
    }, [hideButton]);

    const handleGenerate = async () => {
        if (!selectionState.text || !selectionState.anchorId) return;
        await onGenerate({
            text: selectionState.text,
            anchorId: selectionState.anchorId
        });
        hideButton();
        window.getSelection()?.removeAllRanges();
    };

    return (
        <div data-floating-diagram-button>
            <FloatingDiagramButton
                visible={selectionState.visible}
                x={selectionState.x}
                y={selectionState.y}
                onClick={handleGenerate}
            />
        </div>
    );
};

export default TextSelectionHandler;
