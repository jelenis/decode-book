import { motion } from "framer-motion";
import { squircle } from 'ldrs';
squircle.register();

type LoaderProps = {
  currentSearchText: string;
};

export default function LoadingIndicator({ currentSearchText }: LoaderProps) {
  return (
    <div className='loader-container'>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          scale: { type: "spring", visualDuration: 0.4, bounce: 0.5 },
          opacity: {
            duration: 0.8
          }
        }}
      >
        <l-squircle
          size="40"
          stroke="7"
          stroke-length="0.15"
          bg-opacity="0.1"
          speed="0.9"
          color="var(--text-main)"
        ></l-squircle>
      </motion.div>
      <motion.span
        key={currentSearchText}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{
          duration: 0.6,
          ease: "easeOut"
        }}
        style={{
          marginLeft: '1rem'
        }}
      >
        {currentSearchText}
      </motion.span>
    </div>
  );
}
