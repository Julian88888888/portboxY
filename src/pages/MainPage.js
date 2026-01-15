import React from 'react';
import PortfolioSection from '../components/PortfolioSection';
import MissedDMSection from '../components/MissedDMSection';
import HomeSection from '../components/HomeSection';
import Footer from '../components/Footer';

export default function MainPage() {
  return (
    <>
      <PortfolioSection />
      <MissedDMSection />
      <HomeSection />
      <Footer />
    </>
  );
}
