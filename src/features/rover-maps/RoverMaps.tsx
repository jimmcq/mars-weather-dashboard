/**
 * Mars Rover Location Maps Component
 * Simple links to NASA's official rover location maps
 */

'use client';

import { motion } from 'framer-motion';
import { Map, ExternalLink } from 'lucide-react';

/** Rover map links */
const ROVER_LINKS = [
  {
    name: 'Curiosity',
    location: 'Gale Crater',
    mapLink:
      'https://mars.nasa.gov/maps/location/?mission=MSL&site=NOW&mapLon=137.40823745727542&mapLat=-4.78019237263108&mapZoom=13&globeLon=137.3978687&globeLat=-4.663687049999997&globeZoom=13&globeCamera=0,-2441.40625,0,0,1,0&panePercents=0,100,0&on=Current Position$1.00,Waypoints$1.00,Surface View$1.00,Rover Path$1.00,Labels$1.00,Basemap$1.00,Gale Crater Map$1.00',
    color: 'blue',
  },
  {
    name: 'Perseverance',
    location: 'Jezero Crater',
    mapLink:
      'https://mars.nasa.gov/maps/location/?mission=M20&site=NOW&mapLon=77.28675842285158&mapLat=18.465118360830473&mapZoom=14&globeLon=77.28671777&globeLat=18.465110020000004&globeZoom=11&globeCamera=0,-9765.625,0,0,1,0&panePercents=0,100,0&on=Rover Position$1.00,Rover Waypoints$1.00,Rover Drive Path$1.00,Sampling Locations$1.00,Helicopter Position$1.00,Color Basemap$1.00,Grayscale Basemap$1.00,Northeast Syrtis Base Map$1.00',
    color: 'orange',
  },
];

/**
 * Simple rover maps component - just the essential links
 */
export function RoverMaps(): React.ReactElement {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 backdrop-blur"
    >
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Map className="h-4 w-4 text-orange-400" />
        <h3 className="text-sm font-medium text-white">Rover Location Maps</h3>
      </div>

      {/* Links */}
      <div className="space-y-2">
        {ROVER_LINKS.map((rover, index) => (
          <motion.a
            key={rover.name}
            href={rover.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`group flex items-center justify-between rounded-md border border-slate-600 bg-slate-700/30 p-3 text-sm transition-all hover:border-${rover.color}-500 hover:bg-slate-700/50`}
          >
            <div>
              <span className="font-medium text-white">{rover.name}</span>
              <span className="ml-2 text-slate-400">• {rover.location}</span>
            </div>
            <ExternalLink
              className={`h-3 w-3 text-slate-400 group-hover:text-${rover.color}-400`}
            />
          </motion.a>
        ))}
      </div>

      {/* Small note */}
      <p className="mt-3 text-xs text-slate-500">
        NASA&apos;s interactive maps with real-time positions
      </p>
    </motion.div>
  );
}
