import React, { useState, useEffect } from 'react';
import { FaArrowRight, FaPlay, FaUserPlus } from 'react-icons/fa';

const HeroBanner = () => {
  const backgroundImages = [
    'https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070',
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=2070'
  ];
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
        setTimeout(() => {
          setIsAnimating(false);
        }, 100);
      }, 700);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [backgroundImages.length]);
  
  return (
    <section className="relative min-h-[600px] h-screen overflow-hidden">
      {/* Background Image Slider */}
      <div className="absolute inset-0 w-full h-full">
        {backgroundImages.map((imgUrl, index) => (
          <div
            key={imgUrl}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentImageIndex === index ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${imgUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/50"></div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-16 h-full flex flex-col justify-center">
        <div className="space-y-8 md:space-y-12">
          {/* Titre et Description */}
          <div className="space-y-4 md:space-y-6">
            <h1 className="font-gayathri text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-[7rem] font-bold leading-tight md:leading-tight">
              Découvrez des<br className="hidden sm:block" />
              <span className="text-bookmi-blue">Talents Uniques</span><br className="hidden sm:block" />
              Près de Chez Vous
            </h1>
            <p className="font-gayathri text-gray-300 text-base sm:text-lg md:text-xl font-light max-w-xl">
              Explorez un monde de créativité et trouvez les artistes qui donneront vie à vos événements
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-row items-center gap-3 sm:gap-5">
            <button className="group flex-shrink-0 flex items-center justify-center sm:justify-start gap-2 bg-bookmi-blue hover:bg-primary-light text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300">
              <span className="font-gayathri text-sm sm:text-lg whitespace-nowrap">Commencer</span>
              <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button className="group flex-shrink-0 flex items-center justify-center sm:justify-start gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 sm:px-8 py-3 sm:py-4 rounded-full transition-all duration-300">
              <span className="font-gayathri text-sm sm:text-lg whitespace-nowrap">Avoir mon espace</span>
              <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
            </button>

            <button className="hidden sm:flex items-center justify-center sm:justify-start gap-2 text-white hover:text-bookmi-blue transition-colors duration-300">
              <div className="bg-white/10 hover:bg-white/20 p-3 sm:p-4 rounded-full backdrop-blur-sm">
                <FaPlay className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <span className="font-gayathri text-sm sm:text-lg whitespace-nowrap">Voir la démo</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:items-center md:gap-12 gap-4 sm:gap-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                <span className="text-bookmi-blue font-gayathri text-2xl sm:text-3xl font-bold">2K+</span>
                <span className="text-white/80 font-gayathri text-sm sm:text-base">Artistes</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                <span className="text-bookmi-blue font-gayathri text-2xl sm:text-3xl font-bold">150+</span>
                <span className="text-white/80 font-gayathri text-sm sm:text-base">Événements</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-1 md:gap-2">
                <span className="text-bookmi-blue font-gayathri text-2xl sm:text-3xl font-bold">98%</span>
                <span className="text-white/80 font-gayathri text-sm sm:text-base">Satisfaction</span>
              </div>
              
              {/* Bouton Vidéo Mobile */}
              <button className="sm:hidden flex items-center gap-2 text-white hover:text-bookmi-blue transition-colors duration-300">
                <div className="bg-white/10 hover:bg-white/20 p-3 rounded-full backdrop-blur-sm">
                  <FaPlay className="w-3 h-3" />
                </div>
                <span className="font-gayathri text-sm whitespace-nowrap">Voir la démo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner; 