import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar, Clock, X, ZoomIn } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface HeroProps {
  handleContactClick: () => void;
}

export default function Hero({ handleContactClick }: HeroProps) {
  const { t, language } = useLanguage();
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsImageModalOpen(false);
      }
    };
    if (isImageModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isImageModalOpen]);

  const getBadgeText = () => {
    switch (language) {
      case "en":
        return {
          title: "24/7 Availability",
          desc: "24 hours, 7 days a week"
        };
      case "zh":
        return {
          title: "24/7 全天候服务",
          desc: "每周7天，每天24小时"
        };
      case "fr":
        return {
          title: "Disponibilité 24/7",
          desc: "24 heures sur 24, 7 jours sur 7"
        };
      case "de":
        return {
          title: "24/7 Erreichbarkeit",
          desc: "24 Stunden am Tag, 7 Tage die Woche"
        };
      case "ja":
        return {
          title: "24時間年中無休",
          desc: "1日24時間、週7日"
        };
      case "es":
      default:
        return {
          title: "Atención 24/7",
          desc: "24 horas, los 7 días de la semana"
        };
    }
  };

  const badge = getBadgeText();

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
    >

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white lg:col-span-6 xl:col-span-5"
          >
            {/* Visually hidden H1 for SEO Crawler & Screen Reader Accessibility */}
            <h1 className="sr-only">
              {t("hero.title")}
            </h1>

            {/* Premium Logo Graphic sitting at the top */}
            <img
              src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/Logo_0.0_ujzinn.png"
              alt="Estudio Jurídico Emilia Marsicano & Escribanía Abogada en Capital Federal CABA"
              className="w-full max-w-md sm:max-w-lg h-auto mb-6 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] object-contain"
              referrerPolicy="no-referrer"
              fetchPriority="high"
            />

            <h2 className="text-xl text-gray-200 mb-8 leading-relaxed font-light">
              {t("hero.subtitle")}
            </h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <button
                type="button"
                onClick={handleContactClick}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-4 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer pulse-glow shrink-0"
              >
                <Calendar className="w-5 h-5 mr-2" />
                {t("hero.button")}
              </button>

              {/* Elegant 24/7 Badge */}
              <div className="flex items-center gap-3.5 bg-slate-900/60 border border-primary/30 rounded-2xl px-5 py-3 shadow-xl backdrop-blur-md">
                <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
                  <Clock className="w-5 h-5 text-primary animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-serif font-bold text-sm tracking-wide">
                    {badge.title}
                  </span>
                  <span className="text-xs text-gray-400 font-light font-sans mt-0.5">
                    {badge.desc}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column: Banner / Cartel Display occupying hero sector */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center w-full lg:col-span-6 xl:col-span-7 lg:mt-0 mt-6"
          >
            <div
              onClick={() => setIsImageModalOpen(true)}
              className="relative rounded-2xl overflow-hidden border border-primary/40 shadow-2xl w-full max-w-2xl lg:max-w-full aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] bg-slate-900/40 cursor-pointer group hover:border-primary/80 hover:shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-all duration-300"
              title="Hacé clic para ampliar el cartel"
            >
              <img
                src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/IMG-20250724-WA0008_dlxzk8.jpg"
                alt="Cartel Estudio Jurídico Emilia Marsicano"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Subtle zoom indicator badge */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-primary/40 text-primary p-2.5 rounded-full shadow-xl opacity-90 group-hover:opacity-100 group-hover:scale-110 group-hover:bg-primary group-hover:text-slate-950 transition-all duration-300 flex items-center gap-1.5">
                <ZoomIn className="w-4 h-4" />
                <span className="text-xs font-medium font-sans hidden group-hover:inline pr-1">Ampliar</span>
              </div>

              {/* Golden gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end pointer-events-none">
                <span className="text-primary font-serif italic text-sm sm:text-base">Estudio Jurídico & Escribanía</span>
                <span className="text-white font-semibold text-lg sm:text-xl tracking-wide">Emilia Marsicano</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Lightbox Modal */}
      <AnimatePresence>
        {isImageModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setIsImageModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center justify-center rounded-2xl overflow-hidden bg-slate-950 border border-primary/40 shadow-2xl p-2 sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Visible Close Button */}
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                aria-label="Cerrar imagen"
                className="absolute top-3 right-3 z-20 bg-slate-900/90 hover:bg-primary text-white hover:text-slate-950 p-2.5 rounded-full border border-primary/40 transition-all cursor-pointer shadow-xl flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative overflow-hidden rounded-xl flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/IMG-20250724-WA0008_dlxzk8.jpg"
                  alt="Emilia Marsicano - Abogada"
                  className="max-w-[85vw] max-h-[75vh] w-auto h-auto object-contain rounded-xl shadow-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full text-center py-2.5 px-4 bg-slate-900/90 mt-3 rounded-xl border border-slate-800/80">
                <p className="text-white font-serif font-semibold text-lg sm:text-xl tracking-wide">
                  Emilia Marsicano
                </p>
                <p className="text-xs sm:text-sm text-primary font-sans font-medium mt-0.5">
                  Abogada & Escribana | Capital Federal, Argentina
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

