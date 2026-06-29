import React from "react";
import { motion } from "motion/react";
import { Globe, Calendar } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface InternationalSectionProps {
  handleContactClick: () => void;
}

export default function InternationalSection({ handleContactClick }: InternationalSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="international" className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-gray-900 to-slate-900 rounded-3xl p-8 md:p-12 lg:p-16 border border-primary/20 shadow-2xl flex flex-col lg:flex-row items-center gap-12"
        >
          {/* Animated Globe Icon Column */}
          <div className="flex-shrink-0 text-center lg:text-left">
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror"
              }}
            >
              <Globe className="w-24 h-24 lg:w-32 lg:h-32 text-primary mx-auto lg:mx-0" />
            </motion.div>
          </div>

          {/* Description & Action Column */}
          <div className="text-center lg:text-left flex-grow">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              {t("international.title")}
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t("international.paragraph1")}
            </p>
            <p
              className="text-lg text-muted-foreground mb-8 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: t("international.paragraph2") }}
            />
            <button
              type="button"
              onClick={handleContactClick}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8 py-4 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer pulse-glow mx-auto lg:mx-0"
            >
              <Calendar className="w-5 h-5 mr-3" />
              {t("international.button")}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
