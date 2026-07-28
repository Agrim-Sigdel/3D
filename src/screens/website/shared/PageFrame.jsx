import React, { useRef } from 'react';
import { ScrollFrameContext, useDocumentTitle } from './frameContext.js';

/**
 * The scroll container every website template renders into: a full-viewport
 * fixed page that scrolls internally, with its scrolling element published on
 * ScrollFrameContext so scroll-linked effects have something to measure.
 *
 * Pass `scroll={false}` for the single-viewport designs that must not move.
 */
export default function PageFrame({
    title,
    scroll = true,
    className = '',
    style,
    children,
}) {
    const frameRef = useRef(null);
    useDocumentTitle(title);

    return (
        <ScrollFrameContext.Provider value={frameRef}>
            <div
                ref={frameRef}
                className={`fixed inset-0 overflow-x-clip ${
                    scroll ? 'overflow-y-auto' : 'overflow-y-hidden'
                } ${className}`}
                style={style}
            >
                {children}
            </div>
        </ScrollFrameContext.Provider>
    );
}
