import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle, PhoneCall } from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQSection({ handleContactClick }: { handleContactClick: () => void }) {
  const { language } = useLanguage();
  const [openId, setOpenId] = useState<string | null>("1");

  const faqsByLang: Record<string, FAQItem[]> = {
    es: [
      {
        id: "1",
        question: "¿Cómo funciona la consulta legal online y presencial con la Abogada Emilia Marsicano en Capital Federal?",
        answer: "Ofrecemos consultas legales tanto de manera presencial en CABA como de forma 100% online por videollamada para clientes en toda la Argentina y en el exterior. Podés agendar tu turno directamente desde nuestro sitio web, elegir la fecha y hora conveniente y abonar mediante Mercado Pago o PayPal."
      },
      {
        id: "2",
        question: "¿Cuáles son las principales áreas de práctica legal del Estudio Jurídico?",
        answer: "El Estudio Jurídico Emilia Marsicano se especializa en Derecho Civil (contratos, responsabilidad civil, daños y perjuicios), Derecho de Familia (divorcios express, cuota alimentaria, custodia), Derecho Penal, Derecho Comercial, Derecho Animal, Sucesiones, Gestoría Automotor y Asesoramiento Escribanil."
      },
      {
        id: "3",
        question: "¿Cómo iniciar un trámite de sucesión o divorcio en CABA?",
        answer: "Para iniciar un proceso de sucesión o divorcio en Capital Federal o Provincia de Buenos Aires, coordinamos una primera consulta previa para revisar la documentación requerida (partidas de nacimiento, matrimonio, títulos de propiedad, etc.) y definir la estrategia legal más rápida y eficiente."
      },
      {
        id: "4",
        question: "¿Puedo realizar consultas o tramitaciones desde el extranjero si poseo bienes o asuntos legales en Argentina?",
        answer: "Sí, brindamos atención legal internacional para argentinos residentes en el exterior y ciudadanos extranjeros que necesiten asesoramiento en contratos, compraventa inmobiliaria, herencias o trámites automotores en Argentina sin necesidad de viajar."
      },
      {
        id: "5",
        question: "¿Qué servicios de Gestoría del Automotor y Escribanía ofrecen?",
        answer: "Ofrecemos tramitación integral de transferencias automotores, patentamientos, duplicados de título y cédula, informes de dominio, así como certificaciones de firma, poderes notariales y contratos en coordinación con la escribanía."
      }
    ],
    en: [
      {
        id: "1",
        question: "How does an online or in-person legal consultation work with Emilia Marsicano Law Firm?",
        answer: "We offer both in-person consultations in Buenos Aires (CABA) and 100% online video call appointments for clients across Argentina and worldwide. You can book your appointment directly on our website and pay via PayPal or Mercado Pago."
      },
      {
        id: "2",
        question: "What legal services does the practice specialize in?",
        answer: "Our firm specializes in Civil Law, Family Law (Divorce, Child Custody & Support), Criminal Law, Commercial Law, Animal Rights, Estate & Inheritance (Successions), Automotive Paperwork, and Notary/Escribanía services."
      },
      {
        id: "3",
        question: "Can I manage legal affairs in Argentina from abroad?",
        answer: "Yes, we specialize in international legal representation for expats, foreign investors, and Argentinians living abroad who need assistance with real estate, inheritances, contracts, or business in Argentina."
      }
    ]
  };

  const currentFaqs = faqsByLang[language] || faqsByLang.es;

  // Schema.org FAQPage JSON-LD for AI search engines
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": currentFaqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section id="faq" className="py-20 bg-slate-900/60 border-t border-border/20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-1.5 mb-4 text-primary text-sm font-semibold">
            <HelpCircle className="w-4 h-4" />
            <span>
              {language === "es" ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white mb-4">
            {language === "es"
              ? "Respuestas Claras a tus Dudas Legales en CABA"
              : "Frequently Asked Questions & Answers"}
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            {language === "es"
              ? "Todo lo que necesitás saber antes de agendar tu consulta con el Estudio Emilia Marsicano."
              : "Everything you need to know before booking your legal consultation."}
          </p>
        </motion.div>

        <div className="space-y-4">
          {currentFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-slate-950/70 border border-slate-800 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary/40 shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left text-white font-medium text-base sm:text-lg hover:text-primary transition-colors cursor-pointer gap-4"
                >
                  <span className="leading-snug">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-primary shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : "rotate-0"
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 pt-0 text-muted-foreground text-sm sm:text-base leading-relaxed border-t border-slate-800/50 mt-1">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center bg-slate-950 border border-primary/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="text-left">
            <h3 className="text-lg font-serif font-bold text-white mb-1">
              {language === "es" ? "¿Tenés una consulta específica?" : "Have a specific legal inquiry?"}
            </h3>
            <p className="text-sm text-gray-400">
              {language === "es"
                ? "Estamos disponibles para responder tus inquietudes de inmediato."
                : "We are available 24/7 to answer your questions."}
            </p>
          </div>
          <button
            type="button"
            onClick={handleContactClick}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-6 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all pulse-glow shrink-0 text-sm"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{language === "es" ? "Consultar Ahora" : "Contact Now"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
