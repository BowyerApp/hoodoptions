"use client";

import { motion } from "framer-motion";

/** Letter stagger — pattern from motion-primitives / portfolio intros */
export function TextReveal({
  text,
  className = "",
  delay = 0,
  once = true,
}: {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      className={`inline-block ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-10%" }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.04, delayChildren: delay } },
      }}
    >
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`} className="inline-block whitespace-nowrap mr-[0.3em]">
          {word.split("").map((char, ci) => (
            <motion.span
              key={`${wi}-${ci}`}
              className="inline-block"
              variants={{
                hidden: { y: "110%", opacity: 0, rotateX: 40 },
                show: {
                  y: "0%",
                  opacity: 1,
                  rotateX: 0,
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
}
