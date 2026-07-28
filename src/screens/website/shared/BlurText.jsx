import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * Word-by-word blur-in. Each word rises 50px while sharpening, overshooting 5px
 * past its resting place at the halfway keyframe so the line settles rather
 * than stopping dead.
 *
 * Sibling to `WordsPullUp`, which does the same job with a pure translate; this
 * one is for headings set over video, where the blur reads as focus pulling in.
 *
 * Words are laid out with a flex parent and an em-based right margin rather than
 * a space character: these headings run at `tracking-[-4px]`, which collapses a
 * real space to nothing.
 */

const STEP = { filter: 'blur(5px)', opacity: 0.5, y: -5 };
const TRANSITION = { duration: 0.7, times: [0, 0.5, 1], ease: 'easeOut' };

export default function BlurText({ text, className = '', delayStep = 0.1, as: Tag = 'p' }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.1 });
    const words = text.split(' ').filter(Boolean);

    const MotionTag = Tag === 'h1' ? motion.h1 : Tag === 'h2' ? motion.h2 : motion.p;

    return (
        <MotionTag
            ref={ref}
            className={className}
            style={{ display: 'flex', flexWrap: 'wrap', rowGap: '0.1em' }}
        >
            {words.map((word, i) => (
                <motion.span
                    key={`${word}-${i}`}
                    style={{ display: 'inline-block', marginRight: '0.28em' }}
                    initial={{ filter: 'blur(10px)', opacity: 0, y: 50 }}
                    animate={
                        inView
                            ? {
                                  filter: ['blur(10px)', STEP.filter, 'blur(0px)'],
                                  opacity: [0, STEP.opacity, 1],
                                  y: [50, STEP.y, 0],
                              }
                            : undefined
                    }
                    transition={{ ...TRANSITION, delay: i * delayStep }}
                >
                    {word}
                </motion.span>
            ))}
        </MotionTag>
    );
}
