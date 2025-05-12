import React from 'react';
import { motion } from 'framer-motion';

const SectionBand = ({ sectionName }) => {
  return (
    <div className="relative w-full bg-bookmi-blue py-2 sm:py-3 md:py-4 lg:py-6">
      <div className="max-w-[1400px] mx-auto px-3 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between relative"
        >
          <motion.p 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-white text-lg sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold tracking-wider uppercase text-left pr-4"
          >
            {sectionName}
          </motion.p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: ["0px", "30px", "60px", "100px"] }}
            transition={{ 
              duration: 0.8, 
              delay: 0.3,
              times: [0, 0.3, 0.6, 1]
            }}
            className="h-[1px] sm:h-[2px] md:h-[3px] bg-white/50 absolute right-0"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default SectionBand;