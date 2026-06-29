import React from "react";
import { Scale, Clock } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Service } from "../types";

interface FooterProps {
  services: Service[];
}

export default function Footer({ services }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-950 text-muted-foreground py-12 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <img
                src="https://res.cloudinary.com/dyzedavsd/image/upload/v1779715346/Logo_0.2_zczrfm.png"
                alt="Logo Emilia Marsicano Abogada"
                className="h-10 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Practice Areas Col */}
          <div className="md:col-span-1">
            <span className="text-lg font-semibold text-foreground mb-4 block">
              {t("footer.servicesTitle")}
            </span>
            <ul className="space-y-2 text-muted-foreground columns-2 text-sm">
              {services.map((service) => (
                <li key={service.id} className="hover:text-primary transition-colors">
                  {t(service.title)}
                </li>
              ))}
            </ul>
          </div>

          {/* Attention Hours Col */}
          <div className="md:col-span-1 md:text-right">
            <span className="text-lg font-semibold text-foreground mb-4 block">
              {t("footer.hoursTitle")}
            </span>
            <div className="space-y-2 text-muted-foreground text-sm">
              <div className="flex items-center md:justify-end space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>{t("footer.hoursText")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Bar */}
        <div className="border-t border-border/30 mt-8 pt-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
