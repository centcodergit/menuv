import { gsap } from "@/lib/gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

/**
 * Heavier GSAP plugins, registered on demand. Import from here only inside lazy sections
 * (articles rail, curved loop, referral beams, how-it-works morph), never from above-the-fold code.
 */
gsap.registerPlugin(MorphSVGPlugin, Draggable, InertiaPlugin, MotionPathPlugin);

export { gsap, MorphSVGPlugin, Draggable, InertiaPlugin, MotionPathPlugin };
