import React, { useState } from "react";
import { LanguageProvider, useLanguage } from "./components/LanguageContext";
import SEO from "./components/SEO";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ServicesSection from "./components/ServicesSection";
import InternationalSection from "./components/InternationalSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import ServiceDetailModal from "./components/ServiceDetailModal";
import BookingModal from "./components/BookingModal";
import { servicesData } from "./data/services";
import { Service } from "./types";

function MainApp() {
  const { t, language } = useLanguage();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);

  const handleContactClick = () => {
    setIsBookingOpen(true);
    setIsMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setIsMenuOpen(false);
  };

  // Structured Information for search indexing engines (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Attorney",
    "name": language === "es" ? "Estudio Jurídico Emilia Marsicano" : "Emilia Marsicano Law Firm",
    "description": t("seo.description"),
    "url": language === "es" ? "https://www.emiliamarsicanoabogada.com" : `https://www.emiliamarsicanoabogada.com/?lang=${language}`,
    "image": "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/Logo_0.0_ujzinn.png",
    "logo": "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/Logo_0.0_ujzinn.png",
    "telephone": "+5491165600000",
    "email": "emimarsicano@gmail.com",
    "hasMap": "https://www.google.com/maps/search/?api=1&query=Capital+Federal,+Buenos+Aires",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Capital Federal",
      "addressRegion": "CABA",
      "addressCountry": "AR"
    },
    "openingHours": "Mo-Su 00:00-23:59",
    "priceRange": "$",
    "areaServed": [
      { "@type": "City", "name": "Capital Federal" },
      { "@type": "Country", "name": "Argentina" },
      { "@type": "Place", "name": "Worldwide" }
    ],
    "makesOffer": servicesData.map((s) => ({
      "@type": "Offer",
      "itemOffered": {
        "@type": "LegalService",
        "name": t(s.title)
      }
    }))
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-slate-900 text-gray-100">
      <SEO
        title={t("seo.title")}
        description={t("seo.description")}
        keywords={t("seo.keywords")}
        imageUrl="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/Logo_0.0_ujzinn.png"
        lang={language}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        scrollToSection={scrollToSection}
        handleContactClick={handleContactClick}
      />

      <main>
        <Hero handleContactClick={handleContactClick} />
        <ServicesSection services={servicesData} handleServiceClick={setSelectedService} />
        <InternationalSection handleContactClick={handleContactClick} />
        <ContactSection handleContactClick={handleContactClick} />
      </main>

      <Footer services={servicesData} />

      <ServiceDetailModal
        selectedService={selectedService}
        setSelectedService={setSelectedService}
        handleContactClick={handleContactClick}
      />

      <BookingModal isOpen={isBookingOpen} setIsOpen={setIsBookingOpen} />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}
