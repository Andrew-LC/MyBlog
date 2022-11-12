import { motion } from "framer-motion";

export default function Section({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      delay
      className="flex flex-col items-center justify-center"
    >
      {children}
    </motion.div>
  );
}
