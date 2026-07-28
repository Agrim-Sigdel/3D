import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useScrollFrame } from './frameContext.js';

/**
 * Scroll-linked reading reveal: characters lift from 0.2 to full opacity in
 * sequence as the paragraph crosses the viewport.
 *
 * Each glyph is drawn twice — an invisible copy holds the space so the line
 * never reflows, and an absolutely positioned copy carries the animated
 * opacity. Characters are grouped by word inside an inline-block so the text
 * still wraps between words rather than mid-word.
 */

/**
 * Character offset each word starts at, counting the single space that joins
 * them. Computed here rather than with a counter threaded through the render,
 * so nothing is reassigned while React is rendering.
 */
function wordOffsets(words) {
    const offsets = [];
    let at = 0;
    for (const word of words) {
        offsets.push(at);
        at += word.length + 1;
    }
    return offsets;
}

export default function AnimatedText({
    text,
    as: Tag = 'p',
    className = '',
    style,
    from = 0.2,
}) {
    const ref = useRef(null);
    const container = useScrollFrame();
    const { scrollYProgress } = useScroll({
        target: ref,
        container: container ?? undefined,
        offset: ['start 0.8', 'end 0.2'],
    });

    const words = text.split(' ');
    const offsets = wordOffsets(words);
    const total = text.length;

    return (
        <Tag ref={ref} className={className} style={style}>
            {words.map((word, wordIndex) => (
                <React.Fragment key={`${word}-${wordIndex}`}>
                    <span className="inline-block whitespace-nowrap">
                        {word.split('').map((char, charIndex) => (
                            <AnimatedChar
                                key={charIndex}
                                char={char}
                                progress={scrollYProgress}
                                index={offsets[wordIndex] + charIndex}
                                total={total}
                                from={from}
                            />
                        ))}
                    </span>
                    {wordIndex < words.length - 1 && ' '}
                </React.Fragment>
            ))}
        </Tag>
    );
}

function AnimatedChar({ char, progress, index, total, from }) {
    const charProgress = index / total;
    const opacity = useTransform(
        progress,
        [charProgress - 0.1, charProgress + 0.05],
        [from, 1]
    );

    return (
        <span className="relative inline-block">
            <span className="opacity-0">{char}</span>
            <motion.span className="absolute top-0 left-0" style={{ opacity }}>
                {char}
            </motion.span>
        </span>
    );
}
