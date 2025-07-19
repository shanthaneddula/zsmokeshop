'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full glass-effect text-gray-700 dark:text-gray-200 hover:bg-gray-200 hover:bg-opacity-50 dark:hover:bg-gray-800 dark:hover:bg-opacity-50 transition-colors"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-5 h-5"
      >
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 absolute" />
        ) : (
          <Moon className="w-5 h-5 absolute" />
        )}
      </motion.div>
    </button>
  );
}
