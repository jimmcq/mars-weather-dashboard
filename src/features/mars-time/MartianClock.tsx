/**
 * Real-time Martian Clock Component
 * Displays current Mars time for both rover locations
 */

'use client';

import { useMartianTime } from './useMartianTime';
import { Clock, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export function MartianClock(): React.ReactElement {
  const marsTime = useMartianTime();

  if (!marsTime) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 animate-pulse text-red-400" />
          <h3 className="text-lg font-semibold text-white">Martian Time</h3>
        </div>
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="mb-2 h-4 w-3/4 rounded bg-slate-700"></div>
            <div className="h-8 w-1/2 rounded bg-slate-700"></div>
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
      className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 backdrop-blur"
    >
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Martian Time</h3>
      </div>

      <div className="space-y-6">
        {/* Coordinated Mars Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <p className="mb-1 text-sm text-slate-400">Coordinated Mars Time</p>
          <p className="font-mono text-2xl text-white" aria-live="polite">
            {marsTime.mtc}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Mars Sol Date: {marsTime.msd.toFixed(2)}
          </p>
        </motion.div>

        {/* Curiosity Local Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-t border-slate-700 pt-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <p className="text-sm font-medium text-blue-300">
              Curiosity (Gale Crater)
            </p>
          </div>
          <p className="mb-1 font-mono text-lg text-white" aria-live="polite">
            {marsTime.curiosityLTST}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            <span aria-live="polite">
              Sol {marsTime.curiositySol.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Perseverance Local Time */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="border-t border-slate-700 pt-4"
        >
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" />
            <p className="text-sm font-medium text-orange-300">
              Perseverance (Jezero Crater)
            </p>
          </div>
          <p className="mb-1 font-mono text-lg text-white" aria-live="polite">
            {marsTime.perseveranceLTST}
          </p>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="h-3 w-3" />
            <span aria-live="polite">
              Sol {marsTime.perseveranceSol.toLocaleString()}
            </span>
          </div>
        </motion.div>

        {/* Earth Time Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border-t border-slate-700 pt-4"
        >
          <p className="mb-1 text-xs text-slate-500">Earth UTC Reference</p>
          <p className="font-mono text-sm text-slate-400">
            {marsTime.earthTime}
          </p>
        </motion.div>
      </div>

      {/* Real-time indicator */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="mt-4 flex items-center justify-center border-t border-slate-700 pt-4"
      >
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
          <span>Live updates</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
