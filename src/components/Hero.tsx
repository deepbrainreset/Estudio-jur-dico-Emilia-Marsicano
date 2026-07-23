import React from "react";
import { motion } from "motion/react";
import { Calendar, Scale, Clock } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface HeroProps {
  handleContactClick: () => void;
}

export default function Hero({ handleContactClick }: HeroProps) {
  const { t, language } = useLanguage();

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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Visible H1 for Search Engine and Crawler Accessibility */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white mb-6 leading-snug tracking-tight">
              {t("hero.title")}
            </h1>

            {/* Premium Logo Graphic */}
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

          {/* Right column with professional portrait */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end w-full lg:mt-0 mt-8"
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/40 shadow-2xl max-w-sm sm:max-w-md w-full aspect-[4/5] bg-slate-900/40">
              <img
                src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715344/IMG-20250724-WA0008_dlxzk8.jpg"
                alt="Emilia Marsicano"
                className="w-full h-full object-cover object-top"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              {/* Elegant golden gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end">
                <span className="text-primary font-serif italic text-lg">{t("footer.servicesTitle") === "Services" ? "Abogada" : "Abogada"}</span>
                <span className="text-white font-semibold text-xl tracking-wide">Emilia Marsicano</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
