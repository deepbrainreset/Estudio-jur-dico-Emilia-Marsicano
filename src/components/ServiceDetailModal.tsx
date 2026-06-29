import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, CheckCircle, X, Shield, Users, Building, Heart, Home, PawPrint, Car, FileText, Scale, Calendar, MessageSquare } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Service } from "../types";
import SEO from "./SEO";

interface ServiceDetailModalProps {
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  handleContactClick: () => void;
}

export default function ServiceDetailModal({
  selectedService,
  setSelectedService,
  handleContactClick
}: ServiceDetailModalProps) {
  const { t } = useLanguage();

  const getModalIcon = (service: Service) => {
    const IconComponent = service.modalIcon || Scale;
    return <IconComponent className="w-8 h-8 text-primary-foreground" />;
  };

  return (
    <AnimatePresence>
      {selectedService && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
          onClick={() => setSelectedService(null)}
        >
          <SEO
            title={t(`services.${selectedService.id}.metaTitle`) || t(selectedService.title)}
            description={t(`services.${selectedService.id}.metaDescription`) || t(selectedService.description)}
            keywords={t(`services.${selectedService.id}.keywords`) || t("seo.keywords")}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-border shadow-2xl flex flex-col custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 sm:p-8 flex-grow">
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  {getModalIcon(selectedService)}
                </div>
                <div className="flex-grow min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-foreground break-words">
                    {t(selectedService.title)}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedService(null)}
                  className="text-muted-foreground hover:text-foreground p-1 -m-1 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Overview */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                    {t("serviceDetailModal.overviewTitle")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {t(selectedService.details.overview)}
                  </p>
                </div>

                {/* Common Issues */}
                {selectedService.details.commonIssues && (
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                      {t("serviceDetailModal.commonIssuesTitle")}
                    </h3>
                    <ul className="grid grid-cols-1 gap-2">
                      {Object.values(selectedService.details.commonIssues).map((issueKey, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground text-sm sm:text-base">
                            {t(issueKey)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What We Do */}
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3">
                    {t("serviceDetailModal.whatWeDoTitle")}
                  </h3>
                  <ul className="grid grid-cols-1 gap-2">
                    {Object.values(selectedService.details.services).map((serviceKey, index) => (
                      <li key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground text-sm sm:text-base">
                          {t(serviceKey)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Benefits / Target Audience */}
                <div className="bg-primary/10 rounded-xl p-4 sm:p-6 border border-primary/30">
                  <h3 className="text-lg sm:text-xl font-semibold text-primary mb-3">
                    {t("serviceDetailModal.whyUsTitle")}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                    {t(selectedService.details.benefits)}
                  </p>
                </div>

                {/* Inclusive Design / LGBT-Friendly and Installment Plans */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {selectedService.details.lgbtFriendlyFocus && (
                    <div className="bg-secondary rounded-xl p-4 sm:p-6 border border-border">
                      <div className="flex items-center space-x-3 mb-2">
                        <Users className="w-6 h-6 text-primary" />
                        <h3 className="text-lg font-semibold text-primary">
                          {t("serviceDetailModal.inclusiveSpaceTitle")}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t(selectedService.details.lgbtFriendlyFocus)}
                      </p>
                    </div>
                  )}

                  {selectedService.details.paymentOptions && (
                    <div className="bg-secondary rounded-xl p-4 sm:p-6 border border-border">
                      <div className="flex items-center space-x-3 mb-2">
                        <FileText className="w-6 h-6 text-green-500" />
                        <h3 className="text-lg font-semibold text-green-500">
                          {t("serviceDetailModal.paymentOptionsTitle")}
                        </h3>
                      </div>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {t(selectedService.details.paymentOptions)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-md p-4 sm:p-6 border-t border-border mt-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedService(null);
                    handleContactClick();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl py-4 px-8 text-lg flex items-center justify-center transition-all cursor-pointer w-full max-w-lg mx-auto shadow-lg shadow-primary/15 pulse-glow"
                >
                  <Calendar className="w-5 h-5 mr-3" />
                  {t("serviceDetailModal.bookButton")}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
