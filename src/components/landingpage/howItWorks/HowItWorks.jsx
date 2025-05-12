import React from 'react';
import { motion } from 'framer-motion';
import SectionBand from '../../common/SectionBand';

const HowItWorks = () => {
  const features = [
    {
      title: "Pour les Artistes",
      description: "Créez votre profil professionnel, gérez vos disponibilités et recevez des demandes de réservation en toute simplicité. Développez votre visibilité et votre réputation grâce aux avis clients.",
    },
    {
      title: "Pour les Clients",
      description: "Trouvez l'artiste parfait pour votre événement grâce à notre catalogue détaillé. Réservez en ligne, payez en toute sécurité et profitez d'une prestation artistique exceptionnelle.",
    },
    {
      title: "Paiements Sécurisés",
      description: "Système de paiement fiable avec acompte et solde. Protection garantie pour les artistes et les clients, historique des transactions accessible à tout moment.",
    }
  ];

  return (
    <section id="comment" className="w-full bg-black text-white relative">
      <SectionBand sectionName="Comment ça marche" />
      
      <div className="flex flex-col lg:flex-row min-h-screen max-w-[1440px] mx-auto">
        {/* Section gauche avec image de fond et overlay */}
        <div className="lg:w-1/2 relative overflow-hidden">
          {/* Image de fond principale */}
          <div 
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?ixlib=rb-4.0.3')] 
            bg-cover bg-center transform scale-105 hover:scale-110 transition-transform duration-700"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/50 to-[#EF6C00]/30" />
          </div>

          {/* Éléments de design */}
          <div className="absolute inset-0">
            {/* Cercles décoratifs */}
            <div className="absolute top-20 right-20 w-32 h-32 rounded-full border-2 border-[#EF6C00]/30 animate-pulse" />
            <div className="absolute top-24 right-24 w-40 h-40 rounded-full border border-[#EF6C00]/20" />
            
            {/* Lignes décoratives */}
            <div className="absolute top-0 left-1/2 w-px h-40 bg-gradient-to-b from-transparent via-[#EF6C00]/50 to-transparent" />
            <div className="absolute bottom-0 left-1/3 w-px h-40 bg-gradient-to-b from-transparent via-[#EF6C00]/50 to-transparent" />
          </div>

          {/* Statistiques avec effet de verre */}
          <div className="absolute bottom-10 left-10 z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-white/10 rounded-2xl p-8 backdrop-blur-md border border-white/10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#EF6C00] flex items-center justify-center shadow-lg shadow-[#EF6C00]/30">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2 bg-gradient-to-r from-white to-[#EF6C00] bg-clip-text text-transparent">100%</div>
                  <div className="text-gray-300">Paiements Sécurisés</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Overlay texte artistique */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute top-1/4 left-10 text-8xl font-bold text-white/5"
          >
            ARTISTES
          </motion.div>
        </div>

        {/* Section droite avec le contenu */}
        <div className="lg:w-1/2 px-4 lg:px-16 py-16 md:py-24">
          <div className="max-w-[700px]">
            <div className="mb-20">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-6xl lg:text-7xl font-medium mb-6"
              >
                Une plateforme simple et efficace
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl md:text-2xl text-gray-400"
              >
                Connectez les artistes et les organisateurs d'événements en quelques clics
              </motion.p>
            </div>

            <div className="grid gap-16">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="border-t border-gray-800 pt-8"
                >
                  <div className="flex flex-col gap-4">
                    <h2 className="text-2xl md:text-3xl font-medium">
                      {feature.title}
                    </h2>
                    <p className="text-gray-400 text-lg">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks; 