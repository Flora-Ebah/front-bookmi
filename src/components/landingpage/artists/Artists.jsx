import React, { useState, useEffect } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import SectionBand from '../../common/SectionBand';

const Artists = () => {
  const artists = [
    {
      id: 1,
      name: 'David Moreau',
      role: 'DJ at Lorena Studio',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      id: 2,
      name: 'Sophie Laurent',
      role: 'Creative Lead at Lorena Studio',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      id: 3,
      name: 'Thomas Dubois',
      role: 'QA at Lorena Studio',
      image: 'https://randomuser.me/api/portraits/men/76.jpg',
    },
    {
      id: 4,
      name: 'Claire Martin',
      role: 'PM AI at Lorena Studio',
      image: 'https://randomuser.me/api/portraits/women/63.jpg',
    },
    {
      id: 5,
      name: 'Pierre Lefebvre',
      role: 'Designer at Lorena Studio',
      image: 'https://randomuser.me/api/portraits/men/55.jpg',
    }
  ];

  const [hoveredArtist, setHoveredArtist] = useState(null);
  const controls = useAnimationControls();
  const [width, setWidth] = useState(0);

  // Calculer la largeur totale pour l'animation
  useEffect(() => {
    const cardWidth = 480; // Largeur d'une carte réduite
    const gap = 40; // Maintien de l'espacement
    const totalWidth = (cardWidth + gap) * artists.length;
    setWidth(totalWidth);

    const animate = async () => {
      await controls.start({
        x: -totalWidth,
        transition: {
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }
      });
    };

    animate();
  }, [controls, artists.length]);

  // Dupliquer le tableau des artistes pour créer un effet infini
  const duplicatedArtists = [...artists, ...artists, ...artists];

  return (
    <>
      <SectionBand sectionName="Nos Artistes" />
      <section id="artistes" className="bg-black py-16 md:py-24 px-4 md:px-8 lg:px-16 overflow-hidden">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-8 sm:mb-12 md:mb-24">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-8">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-white text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium md:max-w-2xl"
              >
                Découvrez nos talents artistiques exceptionnels
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-400 text-base sm:text-lg md:text-xl max-w-xl"
              >
                Connectez-vous avec des artistes talentueux pour des événements inoubliables. Musiciens, humoristes, DJs et plus encore.
              </motion.p>
            </div>
          </div>

          <div className="relative overflow-hidden">
            <motion.div 
              className="flex gap-4 sm:gap-6 md:gap-8"
              animate={controls}
              style={{
                width: 'fit-content'
              }}
            >
              {duplicatedArtists.map((artist, index) => (
                <motion.div
                  key={`${artist.id}-${index}`}
                  className="relative w-[280px] sm:w-[380px] md:w-[480px] aspect-[0.9] flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl cursor-pointer group"
                  onHoverStart={() => setHoveredArtist(artist.id)}
                  onHoverEnd={() => setHoveredArtist(null)}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10 
                    transition-all duration-500" />
                  <motion.img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    animate={{
                      scale: hoveredArtist === artist.id ? 1.1 : 1,
                      transition: { duration: 0.7 }
                    }}
                  />
                  <div className="absolute inset-x-0 bottom-0 z-20 p-4 sm:p-6 md:p-8 lg:p-10 transform transition-all duration-500
                    group-hover:translate-y-[-10px]">
                    <h3 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-medium mb-1 sm:mb-2">{artist.name.split(' ')[0]}</h3>
                    <h3 className="text-white text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-medium mb-2 sm:mb-3">{artist.name.split(' ')[1]}</h3>
                    <p className="text-gray-300 text-base sm:text-lg md:text-2xl font-light transform transition-all duration-500">
                      {artist.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Artists; 