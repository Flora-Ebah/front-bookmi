import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import SectionBand from '../../common/SectionBand';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    success: false,
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logique d'envoi du formulaire
  };

  return (
    <>
      <SectionBand sectionName="Contact" />
      <section id="contact" className="min-h-screen bg-[#f8f8ff] flex items-center justify-center p-2 md:p-4">
        <div className="container max-w-[1600px] mx-auto">
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 justify-center">
            {/* Image Card */}
            <div className="w-full md:w-[700px] md:h-[600px]">
              <div className="bg-white rounded-3xl overflow-hidden h-full shadow-2xl">
                <div className="relative w-full h-full">
                  <img
                    src="https://images.pexels.com/photos/7520751/pexels-photo-7520751.jpeg"
                    alt="Concert et performance musicale"
                    className="w-full h-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30 flex items-center justify-center shadow-[inset_0_0_100px_rgba(0,0,0,0.2)]">
                    <div className="text-white p-6 md:p-10">
                      <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                        Créons Ensemble
                      </h2>
                      <p className="text-lg md:text-xl opacity-90 max-w-md drop-shadow-lg">
                        De la scène au studio, donnez vie à vos projets artistiques avec une équipe qui comprend votre vision
                      </p>
                      <p className="text-base md:text-lg opacity-80 mt-4 max-w-md drop-shadow-lg">
                        Concerts, Productions, Événements : Votre succès est notre priorité
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="w-full md:w-[700px] md:h-[600px]">
              <div className="bg-white rounded-3xl p-8 md:p-10 h-full flex flex-col">
                <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
                  <div>
                    <label className="block text-gray-800 font-medium mb-2 text-base">
                      Votre nom complet *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Entrez votre nom"
                      className="w-full px-5 py-3 text-base rounded-xl border border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-medium mb-2 text-base">
                      Votre adresse email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="exemple@email.com"
                      className="w-full px-5 py-3 text-base rounded-xl border border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-medium mb-2 text-base">
                      Comment pouvons-nous vous aider ? *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Sujet de votre message"
                      className="w-full px-5 py-3 text-base rounded-xl border border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20 outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-gray-800 font-medium mb-2 text-base">
                      Décrivez votre projet en détail *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Partagez les détails de votre projet ou de votre demande..."
                      rows="4"
                      className="w-full px-5 py-3 text-base rounded-xl border border-gray-300 focus:border-bookmi-blue focus:ring-2 focus:ring-bookmi-blue/20 outline-none transition-colors resize-none"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-bookmi-blue hover:bg-primary-light text-white font-medium text-base py-3 px-6 rounded-xl transition-colors relative overflow-hidden group"
                  >
                    <span className="relative z-10">Envoyer le message</span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 group-hover:h-full transition-all duration-300"></div>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact; 