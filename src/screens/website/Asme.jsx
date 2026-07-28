import React from 'react';
import BackButton from '../BackButton.jsx';
import PageFrame from './shared/PageFrame.jsx';
import GlassHero from './shared/GlassHero.jsx';

/**
 * Asme — a newsletter hero, and nothing else. One locked viewport: glass nav,
 * serif headline, capture field, social row.
 *
 * The shell is `./shared/GlassHero`, which `know-it-all` also builds on. What
 * belongs to this template is the headline and how the video is framed.
 *
 * On the crop: the brief asks for `translate-y-[17%]` on a full-height element,
 * and describes the result as cropping the top of the frame so the lower portion
 * shows. Those disagree — shifting a full-height element down leaves an empty
 * band along the top edge, directly under the navbar. The pairing below gets the
 * described framing: 17% taller than the frame, lifted by the same 17%, so the
 * top of the clip is cropped away and nothing is left uncovered.
 */

const HERO_VIDEO = '/assets/asme/hero.mp4';

export default function Asme() {
    return (
        <PageFrame title="Asme — Built for the Curious" scroll={false} className="bg-black">
            <BackButton top={92} left={24} />
            <GlassHero
                video={HERO_VIDEO}
                videoClassName="absolute inset-0 z-0 h-[117%] w-full -translate-y-[17%] object-cover"
                heading="Built for the curious"
                headingClassName="font-serif-accent m-0 mb-8 text-5xl tracking-tight whitespace-nowrap text-white md:text-6xl lg:text-7xl"
            />
        </PageFrame>
    );
}
