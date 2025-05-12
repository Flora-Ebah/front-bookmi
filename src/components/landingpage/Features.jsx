import React from 'react';

const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="font-montserrat text-h2 text-center mb-12 text-gray-900">Nos fonctionnalités clés</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-primary-light rounded-full mb-4 flex items-center justify-center text-white">1</div>
            <h3 className="font-montserrat text-h5 mb-3 text-gray-900">Trouvez l'artiste idéal</h3>
            <p className="text-body-sm text-gray-800">Explorez notre catalogue d'artistes talentueux et filtrez selon vos critères pour trouver le partenaire parfait pour votre événement.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-primary-light rounded-full mb-4 flex items-center justify-center text-white">2</div>
            <h3 className="font-montserrat text-h5 mb-3 text-gray-900">Réservez en toute simplicité</h3>
            <p className="text-body-sm text-gray-800">Notre processus de réservation transparent vous permet de planifier votre événement sans tracas.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <div className="w-12 h-12 bg-primary-light rounded-full mb-4 flex items-center justify-center text-white">3</div>
            <h3 className="font-montserrat text-h5 mb-3 text-gray-900">Paiements sécurisés</h3>
            <p className="text-body-sm text-gray-800">Profitez de notre système de paiement sécurisé qui protège les intérêts des artistes et des clients.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features; 