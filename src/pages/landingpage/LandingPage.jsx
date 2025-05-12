import React from 'react';
import Header from '../../components/landingpage/Header';
import HeroBanner from '../../components/landingpage/HeroBanner';
import Artists from '../../components/landingpage/artists/Artists';
import HowItWorks from '../../components/landingpage/howItWorks/HowItWorks';
import Pricing from '../../components/landingpage/pricing/Pricing';
import Contact from '../../components/landingpage/contact/Contact';
import Footer from '../../components/landingpage/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white font-opensans">
      <Header />
      <HeroBanner />
      <Artists />
      <HowItWorks />
      <Pricing />
      <Contact />
      <Footer />
    </div>
  );
};

export default LandingPage; 