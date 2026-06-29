import React from "react";
import { motion } from "motion/react";
import { Calendar } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface ContactSectionProps {
  handleContactClick: () => void;
}

export default function ContactSection({ handleContactClick }: ContactSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="contacto" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight gradient-text mb-6 py-2 leading-tight">
            {t("contact.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            {t("contact.subtitle")}
          </p>
          <button
            type="button"
            onClick={handleContactClick}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl py-8 px-10 text-lg flex items-center justify-center transition-all cursor-pointer mx-auto pulse-glow"
          >
            <Calendar className="w-5 h-5 mr-3" />
            {t("contact.button")}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
