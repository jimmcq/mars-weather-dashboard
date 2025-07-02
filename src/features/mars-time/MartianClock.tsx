/**
 * Real-time Martian Clock Component
 * Displays current Mars time for both rover locations
 */

'use client';

import { useMartianTime } from './useMartianTime';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function MartianClock() {
  const marsTime = useMartianTime();

  if (!marsTime) {
    return (
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-red-400 animate-pulse" />
          <h3 className="text-lg font-semibold text-white">Martian Time</h3>
        </div>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Martian Time</h3>
      </div>
      
      <div className="space-y-6">
        {/* Coordinated Mars Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="text-sm text-slate-400 mb-1">Coordinated Mars Time</p>
          <p className="text-2xl font-mono text-white">{marsTime.mtc}</p>
          <p className="text-xs text-slate-500 mt-1">Mars Sol Date: {marsTime.msd.toFixed(2)}</p>
        </motion.div>
        
        {/* Curiosity Local Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-t border-slate-700 pt-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-blue-400" />
            <p className="text-sm font-medium text-blue-300">Curiosity (Gale Crater)</p>
          </div>
          <p className="text-lg font-mono text-white mb-1">{marsTime.curiosityLTST}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Sol {marsTime.curiositySol.toLocaleString()}</span>
          </div>
        </motion.div>
        
        {/* Perseverance Local Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-slate-700 pt-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-medium text-orange-300">Perseverance (Jezero Crater)</p>
          </div>
          <p className="text-lg font-mono text-white mb-1">{marsTime.perseveranceLTST}</p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3 h-3" />
            <span>Sol {marsTime.perseveranceSol.toLocaleString()}</span>
          </div>
        </motion.div>
        
        {/* Earth Time Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t border-slate-700 pt-4"
        >
          <p className="text-xs text-slate-500 mb-1">Earth UTC Reference</p>
          <p className="text-sm font-mono text-slate-400">{marsTime.earthTime}</p>
        </motion.div>
      </div>
      
      {/* Real-time indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="flex items-center justify-center mt-4 pt-4 border-t border-slate-700"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates</span>
        </div>
      </motion.div>
    </motion.div>
  );
}