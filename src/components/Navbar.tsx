import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Menu, Calendar, Globe, ChevronDown, Scale } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface NavbarProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  scrollToSection: (id: string) => void;
  handleContactClick: () => void;
}

const languagesList = [
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "日本語", flag: "🇯🇵" }
];

export default function Navbar({
  isMenuOpen,
  setIsMenuOpen,
  scrollToSection,
  handleContactClick
}: NavbarProps) {
  const { t, language, changeLanguage } = useLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const getSubTitleText = () => {
    switch (language) {
      case "en":
        return "Attorney, Notary & Automotive Paperwork";
      case "zh":
        return "律师、公证处与车辆业务代办";
      case "fr":
        return "Avocate, Notaire & Formalités Automobiles";
      case "de":
        return "Anwältin, Notarin & Kfz-Abwicklung";
      case "ja":
        return "弁護士・公証人・自動車登録手続代行";
      case "es":
      default:
        return "Abogada, Escribana y Gestoría del Automotor";
    }
  };

  const currentLang = languagesList.find((l) => l.code === language) || languagesList[0];

  return (
    <nav className="fixed top-0 w-full z-50 glass-effect">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <motion.div
            className="flex items-center cursor-pointer h-full gap-3"
            onClick={() => scrollToSection("inicio")}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img
              src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715346/Logo_0.2_zczrfm.png"
              alt="Logo Emilia Marsicano Abogada"
              className="h-12 w-auto object-contain py-1"
              referrerPolicy="no-referrer"
              fetchPriority="high"
            />
            <div className="flex flex-col border-l border-primary/20 pl-3 py-1 select-none">
              <span className="font-serif text-sm sm:text-base font-bold tracking-wider text-white leading-tight uppercase">
                Emilia Marsicano
              </span>
              <span className="text-[8px] sm:text-[9.5px]/[12px] font-sans font-medium tracking-wide text-primary mt-0.5 leading-tight max-w-[140px] sm:max-w-none">
                {getSubTitleText()}
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t("navbar.home")}
            </button>
            <button
              onClick={() => scrollToSection("servicios")}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t("navbar.services")}
            </button>
            <button
              onClick={() => scrollToSection("international")}
              className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {t("navbar.international")}
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center text-muted-foreground hover:text-primary hover:bg-transparent px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
              >
                <Globe className="w-5 h-5 text-primary" />
                <span className="ml-2 hidden lg:inline">{currentLang.name}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsLangOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-40 bg-background border border-border rounded-lg shadow-lg z-50 p-1"
                    >
                      {languagesList.map((item) => (
                        <button
                          key={item.code}
                          type="button"
                          onClick={() => {
                            changeLanguage(item.code);
                            setIsLangOpen(false);
                          }}
                          className={`w-full text-left flex items-center px-4 py-2.5 text-sm rounded-md hover:bg-primary/10 transition-colors cursor-pointer ${
                            language === item.code ? "text-primary font-semibold" : "text-foreground"
                          }`}
                        >
                          <span className="mr-2">{item.flag}</span>
                          <span>{item.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Primary Action */}
            <button
              type="button"
              onClick={handleContactClick}
              className="bg-primary text-primary-foreground hover:bg-primary/95 font-semibold px-4 py-2 rounded-lg flex items-center transition-all cursor-pointer shadow"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {t("navbar.bookConsultation")}
            </button>
          </div>

          {/* Hamburger Menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-foreground hover:text-primary transition-all p-2 cursor-pointer"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection("inicio")}
                className="block w-full text-left font-medium text-foreground hover:text-primary py-2"
              >
                {t("navbar.home")}
              </button>
              <button
                onClick={() => scrollToSection("servicios")}
                className="block w-full text-left font-medium text-foreground hover:text-primary py-2"
              >
                {t("navbar.services")}
              </button>
              <button
                onClick={() => scrollToSection("international")}
                className="block w-full text-left font-medium text-foreground hover:text-primary py-2"
              >
                {t("navbar.international")}
              </button>

              {/* Mobile Language Selector */}
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 px-2">
                  {t("navbar.language") || "Language"}
                </p>
                <div className="flex flex-wrap gap-2 px-2">
                  {languagesList.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        changeLanguage(item.code);
                        setIsMenuOpen(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all flex items-center ${
                        language === item.code
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      <span className="mr-1.5">{item.flag}</span>
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Primary Action */}
              <button
                type="button"
                onClick={handleContactClick}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-semibold py-3 rounded-lg flex items-center justify-center transition-colors cursor-pointer mt-4"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {t("navbar.bookConsultation")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
