import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-8 md:mb-0">
            <h4 className="font-montserrat text-h4 mb-4">Talent Artistique</h4>
            <p className="text-body-sm text-gray-500 max-w-md">
              La meilleure plateforme pour connecter artistes et organisateurs d'événements.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h5 className="font-montserrat text-h6 mb-4">Navigation</h5>
              <ul className="space-y-2 text-body-sm text-gray-500">
                <li><a href="#" className="hover:text-white">Accueil</a></li>
                <li><a href="#" className="hover:text-white">Artistes</a></li>
                <li><a href="#" className="hover:text-white">Comment ça marche</a></li>
                <li><a href="#" className="hover:text-white">Tarifs</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-montserrat text-h6 mb-4">Légal</h5>
              <ul className="space-y-2 text-body-sm text-gray-500">
                <li><a href="#" className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white">Confidentialité</a></li>
                <li><a href="#" className="hover:text-white">CGU</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-montserrat text-h6 mb-4">Contact</h5>
              <ul className="space-y-2 text-body-sm text-gray-500">
                <li>contact@talent-artistique.com</li>
                <li>+123 456 789</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-body-sm text-gray-500">
          <p>© {new Date().getFullYear()} Plateforme Digitale de Talent Artistique. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 