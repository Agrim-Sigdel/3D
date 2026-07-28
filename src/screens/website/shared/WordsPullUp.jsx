import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Word-by-word pull-up reveal: each word rises from 20px with a 0.08s stagger,
 * fired once when the block scrolls into view.
 *
 * Two entry points share the animation:
 *
 *   WordsPullUp            one string, one style
 *   WordsPullUpMultiStyle  [{ text, className }] — styles mixed mid-sentence,
 *                          still staggering across the whole run rather than
 *                          restarting per segment
 */

const WORD_TRANSITION = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };
const STAGGER = 0.08;

function Word({ index, className = '', children }) {
    return (
        <motion.span
            className={`inline-block ${className}`}
            variants={{
                hidden: { opacity: 0, y: 20 },
                shown: { opacity: 1, y: 0 },
            }}
            transition={{ ...WORD_TRANSITION, delay: index * STAGGER }}
        >
            {children}
        </motion.span>
    );
}

/**
 * The trailing asterisk on Prisma's wordmark. The final character keeps its
 * place in the flow and the marker hangs off it, so the glyph itself is not
 * nudged by the superscript.
 */
function WordWithAsterisk({ index, word, className = '' }) {
    const head = word.slice(0, -1);
    const last = word.slice(-1);

    return (
        <Word index={index} className={className}>
            {head}
            <span className="relative inline-block">
                {last}
                <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
            </span>
        </Word>
    );
}

export default function WordsPullUp({
    text,
    className = '',
    wordClassName = '',
    showAsterisk = false,
}) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    const words = text.split(' ');

    return (
        <span ref={ref} className={className}>
            <motion.span
                className="inline-flex flex-wrap"
                initial="hidden"
                animate={inView ? 'shown' : 'hidden'}
            >
                {words.map((word, i) => {
                    const isLast = i === words.length - 1;
                    return (
                        <React.Fragment key={`${word}-${i}`}>
                            {showAsterisk && isLast ? (
                                <WordWithAsterisk index={i} word={word} className={wordClassName} />
                            ) : (
                                <Word index={i} className={wordClassName}>
                                    {word}
                                </Word>
                            )}
                            {!isLast && <span className="inline-block">&nbsp;</span>}
                        </React.Fragment>
                    );
                })}
            </motion.span>
        </span>
    );
}

/**
 * Segments are `{ text, className, newLine }`. `newLine` starts that segment on
 * its own row — a full-width spacer forces the wrap, since the words all live in
 * one flex container so the stagger can run across the whole heading rather than
 * restarting per segment.
 */
export function WordsPullUpMultiStyle({ segments, className = '' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });

    const words = segments.flatMap((segment, segmentIndex) =>
        segment.text
            .split(' ')
            .filter(Boolean)
            .map((word, wordIndex) => ({
                word,
                className: segment.className ?? '',
                breakBefore: Boolean(segment.newLine) && wordIndex === 0 && segmentIndex > 0,
            }))
    );

    return (
        <div ref={ref} className={className}>
            <motion.span
                className="inline-flex flex-wrap justify-center"
                initial="hidden"
                animate={inView ? 'shown' : 'hidden'}
            >
                {words.map(({ word, className: wordClassName, breakBefore }, i) => (
                    <React.Fragment key={`${word}-${i}`}>
                        {breakBefore && <span className="basis-full" />}
                        <Word index={i} className={wordClassName}>
                            {word}
                        </Word>
                        {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
                    </React.Fragment>
                ))}
            </motion.span>
        </div>
    );
}
