import { useMotionPreference } from "@/providers/MotionPreference";

/** True when the OS asks for reduced motion or the visitor turned motion down in the footer. */
export function useReducedMotion() {
  return useMotionPreference().reduced;
}

export default useReducedMotion;
