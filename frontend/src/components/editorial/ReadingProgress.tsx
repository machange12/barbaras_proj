import { motion, useScroll, useSpring } from 'framer-motion';

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.2,
  });

  return <motion.div aria-hidden="true" className="reading-progress" style={{ scaleX }} />;
}
