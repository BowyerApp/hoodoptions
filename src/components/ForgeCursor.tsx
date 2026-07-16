"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

/** Inspired by stephenscaff/react-animated-cursor — copper desk ring */
export function ForgeCursor() {
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    document.documentElement.classList.add("has-forge-cursor");
    setVisible(true);

    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = t?.closest("a,button,[data-cursor],input,select");
      setHover(!!interactive);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.documentElement.classList.remove("has-forge-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  if (!visible) return null;

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[9999] mix-blend-difference"
        style={{
          left: 0,
          top: 0,
          x: sx,
          y: sy,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <div
          className="rounded-full border border-copper transition-all duration-150"
          style={{
            width: hover ? 44 : 28,
            height: hover ? 44 : 28,
            opacity: 0.9,
          }}
        />
      </motion.div>
      <motion.div
        className="pointer-events-none fixed z-[9999] bg-copper rounded-full"
        style={{
          left: 0,
          top: 0,
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: 4,
          height: 4,
        }}
      />
    </>
  );
}
