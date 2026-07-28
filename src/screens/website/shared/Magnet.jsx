import React, { useEffect, useRef } from 'react';

/**
 * Magnetic hover: the wrapped element drifts toward the cursor once the cursor
 * is within `padding` of its bounding box, then eases back when it leaves.
 *
 * The transform is written straight to the node rather than held in state —
 * mousemove fires far too often to re-render on, and the element's position is
 * a per-frame value with no bearing on the rest of the tree.
 */
export default function Magnet({
    children,
    padding = 100,
    strength = 2,
    activeTransition = 'transform 0.3s ease-out',
    inactiveTransition = 'transform 0.5s ease-in-out',
    className = '',
    innerClassName = '',
    style,
}) {
    const wrapperRef = useRef(null);
    const innerRef = useRef(null);

    useEffect(() => {
        const inner = innerRef.current;
        const wrapper = wrapperRef.current;
        if (!inner || !wrapper) return undefined;

        let frame = 0;
        let active = false;

        const apply = (clientX, clientY) => {
            const rect = wrapper.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const withinX = Math.abs(clientX - centerX) < rect.width / 2 + padding;
            const withinY = Math.abs(clientY - centerY) < rect.height / 2 + padding;

            if (withinX && withinY) {
                active = true;
                const x = (clientX - centerX) / strength;
                const y = (clientY - centerY) / strength;
                inner.style.transition = activeTransition;
                inner.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            } else if (active) {
                active = false;
                inner.style.transition = inactiveTransition;
                inner.style.transform = 'translate3d(0px, 0px, 0)';
            }
        };

        const onMove = event => {
            if (frame) return;
            const { clientX, clientY } = event;
            frame = requestAnimationFrame(() => {
                frame = 0;
                apply(clientX, clientY);
            });
        };

        window.addEventListener('mousemove', onMove, { passive: true });

        return () => {
            if (frame) cancelAnimationFrame(frame);
            window.removeEventListener('mousemove', onMove);
        };
    }, [padding, strength, activeTransition, inactiveTransition]);

    return (
        <div ref={wrapperRef} className={className} style={style}>
            <div
                ref={innerRef}
                className={innerClassName}
                style={{ willChange: 'transform', transition: inactiveTransition }}
            >
                {children}
            </div>
        </div>
    );
}
