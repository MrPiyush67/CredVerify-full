import React from 'react';
import { motion } from 'framer-motion';

const HOLOGRAM_IMAGES = {
  girl: '/landing/girl_upscaled-Photoroom.png',
  leftScreen: '/landing/left screen.jpg',
  rightScreen: '/landing/cleaned_right screen-Photoroom.png',
  planet1: '/landing/cleaned_planet 1-Photoroom.png',
  planet2: '/landing/cleaned_planet 2-Photoroom.png',
  telescope: '/landing/cleaned_telescope-Photoroom.png',
  dna1: '/landing/enhanced_bna_1-Photoroom.png',
  dna2: '/landing/dna 2.jpg_upscaled-Photoroom.png',
  blueParticles: '/landing/enhanced_blue_particles-Photoroom.png',
  greenParticles: '/landing/green_particles_upscaled-Photoroom.png',
  flask: '/landing/flask.jpg_upscaled-Photoroom.png',
  flaskDrop1: '/landing/flask_drop_1.png',
  flaskDrop2: '/landing/flask_drop 2.png',
  chatIcon: '/landing/enhanced_chat.png',
  honeycomb: '/landing/honeycomb_upscaled-Photoroom.png',
  hoverboard: '/landing/hover_board_upscaled-Photoroom.png',
  cube: '/landing/cube-Photoroom.png'
};

// Elegant floating animation
const float = (duration = 6, delay = 0, distance = 15) => ({
  animate: { y: [0, -distance, 0] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
    delay
  }
});

// Subtle rotation for planets/DNA
const rotate = (duration = 20, delay = 0) => ({
  animate: { rotate: [0, 5, 0, -5, 0] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "linear",
    delay
  }
});

// Pulse for particles
const pulse = (duration = 4, delay = 0) => ({
  animate: { opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] },
  transition: {
    duration,
    repeat: Infinity,
    ease: "easeInOut",
    delay
  }
});

const HologramElement = React.memo(({ src, className = '', zIndex = 6, ...props }) => (
  <motion.div
    className={`absolute inset-0 pointer-events-none ${className}`}
    style={{ zIndex, willChange: 'transform, opacity' }}
    {...props}
  >
    <img
      src={src}
      alt="Hologram Element"
      className="w-full h-full object-contain"
      style={{ filter: 'drop-shadow(0 0 20px rgba(70, 172, 194, 0.2))' }}
    />
  </motion.div>
));

const HologramScene = React.memo(() => {
  return (
    <div className="relative w-full h-full overflow-hidden bg-transparent" style={{ perspective: '1000px' }}>
      <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
        {/* Center Character - Stable but breathing */}
        <HologramElement
          src={HOLOGRAM_IMAGES.girl}
          zIndex={8}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
          transition={{ duration: 1.5, ease: "easeOut", y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        />

        {/* Screens - Tech feel */}
        <HologramElement
          src={HOLOGRAM_IMAGES.leftScreen}
          zIndex={10}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{ duration: 1, delay: 0.2, y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }}
        />
        <HologramElement
          src={HOLOGRAM_IMAGES.rightScreen}
          zIndex={10}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0, y: [0, -5, 0] }}
          transition={{ duration: 1, delay: 0.3, y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 } }}
        />

        {/* Floating Elements - Organic movement */}
        <HologramElement src={HOLOGRAM_IMAGES.planet1} {...float(7, 0, 12)} {...rotate(25)} />
        <HologramElement src={HOLOGRAM_IMAGES.planet2} {...float(8, 1, 15)} {...rotate(30, 2)} />
        <HologramElement src={HOLOGRAM_IMAGES.telescope} {...float(6.5, 0.5, 10)} />

        <HologramElement src={HOLOGRAM_IMAGES.dna1} {...float(5.5, 1.5, 8)} {...rotate(15)} />
        <HologramElement src={HOLOGRAM_IMAGES.dna2} {...float(6, 2, 8)} {...rotate(18, 1)} />

        {/* Science Group */}
        <HologramElement src={HOLOGRAM_IMAGES.flask} {...float(5, 1, 6)} />
        <HologramElement src={HOLOGRAM_IMAGES.flaskDrop1} {...float(4, 1.2, 15)} />
        <HologramElement src={HOLOGRAM_IMAGES.flaskDrop2} {...float(4.5, 1.5, 12)} />

        {/* Restored Elements */}
        <HologramElement src={HOLOGRAM_IMAGES.chatIcon} {...float(6, 0.5, 10)} />
        <HologramElement src={HOLOGRAM_IMAGES.honeycomb} {...float(7, 1, 12)} {...rotate(40)} />
        <HologramElement src={HOLOGRAM_IMAGES.hoverboard} {...float(5.5, 1.5, 8)} />
        <HologramElement src={HOLOGRAM_IMAGES.cube} {...float(8, 2, 14)} {...rotate(30)} />

        {/* Atmosphere */}
        <HologramElement
          src={HOLOGRAM_IMAGES.blueParticles}
          zIndex={5}
          className="opacity-60 mix-blend-screen"
          {...pulse(5, 0)}
        />
        <HologramElement
          src={HOLOGRAM_IMAGES.greenParticles}
          zIndex={5}
          className="opacity-60 mix-blend-screen"
          {...pulse(6, 2)}
        />
      </div>
    </div>
  );
});

HologramScene.displayName = 'HologramScene';

export default HologramScene;
