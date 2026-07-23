import React from "react";
import { Clock, MapPin, Phone, Mail, Globe, ExternalLink } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Service } from "../types";

interface FooterProps {
  services: Service[];
}

export default function Footer({ services }: FooterProps) {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gray-950 text-muted-foreground py-16 border-t border-border/30 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand & Bio Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715346/Logo_0.2_zczrfm.png"
                alt="Logo Emilia Marsicano Abogada en Capital Federal CABA"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
              {t("footer.tagline")}
            </p>
            <div className="pt-2">
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">
                {language === "es" ? "Navegación Rápida" : "Quick Navigation"}
              </p>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <li>
                  <a href="#inicio" className="hover:text-primary transition-colors">
                    {t("navbar.home")}
                  </a>
                </li>
                <li>
                  <a href="#servicios" className="hover:text-primary transition-colors">
                    {t("navbar.services")}
                  </a>
                </li>
                <li>
                  <a href="#international" className="hover:text-primary transition-colors">
                    {t("navbar.international")}
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-primary transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#contacto" className="hover:text-primary transition-colors">
                    {t("contact.title") || "Contacto"}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Practice Areas / Services Col */}
          <div>
            <h3 className="text-base font-serif font-bold text-foreground mb-4">
              {t("footer.servicesTitle")}
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <a
                    href={`#${service.id}`}
                    className="hover:text-primary transition-colors inline-flex items-center gap-1.5"
                  >
                    <span className="text-primary/70">›</span>
                    <span>{t(service.title)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Location & Direct Contact Col */}
          <div>
            <h3 className="text-base font-serif font-bold text-foreground mb-4">
              {language === "es" ? "Ubicación y Contacto" : "Location & Contact"}
            </h3>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Capital+Federal,+Buenos+Aires"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  Capital Federal (CABA), Buenos Aires, Argentina
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="https://wa.me/5491165600000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors font-medium"
                >
                  +54 9 11 6560-0000 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="mailto:emimarsicano@gmail.com"
                  className="hover:text-primary transition-colors"
                >
                  emimarsicano@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-primary shrink-0" />
                <a
                  href="https://www.emiliamarsicanoabogada.com/"
                  className="hover:text-primary transition-colors"
                >
                  www.emiliamarsicanoabogada.com
                </a>
              </li>
            </ul>
          </div>

          {/* Schedule & Online Service Col */}
          <div>
            <h3 className="text-base font-serif font-bold text-foreground mb-4">
              {t("footer.hoursTitle")}
            </h3>
            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center gap-2.5 bg-slate-900 border border-slate-800 p-3 rounded-lg">
                <Clock className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <p className="font-semibold text-white">{t("footer.hoursText")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {language === "es" ? "Atención online y presencial con turno previo" : "Online & in-person appointments"}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="#contacto"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                >
                  <span>{language === "es" ? "Agendar una consulta profesional" : "Schedule a legal consultation"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="border-t border-border/30 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
          <p className="text-gray-500">
            {language === "es"
              ? "Estudio Jurídico Emilia Marsicano - Abogada Matricular CABA & Provincia de Buenos Aires."
              : "Emilia Marsicano Law Firm - Licensed Attorney in Buenos Aires, Argentina."}
          </p>
        </div>
      </div>
    </footer>
  );
}
