import React from 'react';
import { motion } from 'framer-motion';
import SectionBand from '../../common/SectionBand';

const Pricing = () => {
  const plans = [
    {
      icon: "💎",
      title: "Premium",
      subtitle: "Expert",
      price: "50 000 XOF",
      buttonText: "Commencer maintenant",
      features: [
        { name: "Médias illimités", icon: "🎥" },
        { name: "Marketing ciblé", icon: "🎯" },
        { name: "Mise en avant", icon: "⭐" },
        { name: "Coaching VIP", icon: "👑" },
        { name: "Masterclass accès", icon: "🎓" },
        { name: "Revenu prévisionnel", icon: "📈" }
      ]
    },
    {
      icon: "⭐",
      title: "Standard",
      subtitle: "Pro",
      price: "25 000 XOF",
      buttonText: "Choisir ce plan",
      features: [
        { name: "15 médias max", icon: "📸" },
        { name: "Badge vérifié", icon: "✓" },
        { name: "Stats avancées", icon: "📊" },
        { name: "Support Pro", icon: "🔧" },
        { name: "Multi-événements", icon: "🗓" },
        { name: "Paiement sécurisé", icon: "🔒" }
      ]
    },
    {
      icon: "☀",
      title: "Basic",
      subtitle: "Débutant",
      price: "Gratuit",
      buttonText: "Commencer gratuitement",
      features: [
        { name: "3 médias max", icon: "📱" },
        { name: "Profil de base", icon: "👤" },
        { name: "Calendrier", icon: "📅" },
        { name: "Support basique", icon: "💬" },
        { name: "3 demandes/mois", icon: "📩" },
        { name: "Avis clients", icon: "⭐" }
      ]
    }
  ];

  return (
    <>
      <SectionBand sectionName="Nos Tarifs" />
      <section id="tarifs" className="w-full bg-[#fafafa] py-20">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-[32px] p-10 min-h-[520px] flex flex-col"
              >
                {/* Icon Circle */}
                <div className="mb-12">
                  <div className="w-14 h-14 rounded-full bg-[#f4f4f4] flex items-center justify-center">
                    <span className="text-2xl">{plan.icon}</span>
                  </div>
                </div>

                {/* Title */}
                <div className="mb-8">
                  <h3 className="text-[40px] leading-tight mb-1">{plan.title}</h3>
                  <p className="text-[40px] leading-tight">{plan.subtitle}</p>
                </div>

                {/* Price */}
                <div className="mb-8">
                  <p className="text-2xl font-medium text-bookmi-blue">{plan.price}</p>
                  <p className="text-gray-500 text-sm">par mois</p>
                </div>

                {/* Features Section */}
                <div className="flex-grow">
                  <h4 className="text-lg mb-4">Fonctionnalités</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {plan.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1.5 bg-[#f4f4f4] rounded-full py-2 px-3"
                      >
                        <span className="text-base">{feature.icon}</span>
                        <span className="text-[13px] font-medium truncate">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bouton d'action */}
                <div className="mt-8">
                  <button 
                    className={`w-full py-3 px-6 rounded-full font-medium transition-all duration-300 
                    ${index === 0 
                      ? 'bg-bookmi-blue text-white hover:bg-primary-light' 
                      : index === 1 
                        ? 'bg-bookmi-dark text-white hover:bg-secondary-light' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    {plan.buttonText}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Pricing; 