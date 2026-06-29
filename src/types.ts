import { ComponentType } from "react";

export interface ServiceDetail {
  overview: string;
  commonIssues?: { [key: string]: string } | string[];
  services: { [key: string]: string } | string[];
  benefits: string;
  lgbtFriendlyFocus?: string | null;
  paymentOptions?: string;
}

export interface Service {
  id: string;
  icon: string | ComponentType<any>;
  modalIcon?: ComponentType<any>;
  title: string;
  description: string;
  details: ServiceDetail;
}

export interface TranslationDict {
  navbar: {
    home: string;
    services: string;
    international: string;
    bookConsultation: string;
    language: string;
  };
  hero: {
    title: string;
    alt_logo: string;
    subtitle: string;
    button: string;
  };
  services: {
    title: string;
    subtitle: string;
    detailsButton: string;
    [key: string]: any;
  };
  international: {
    title: string;
    paragraph1: string;
    paragraph2: string;
    button: string;
  };
  contact: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    tagline: string;
    servicesTitle: string;
    hoursTitle: string;
    hoursText: string;
    copyright: string;
  };
  bookingModal: {
    title: string;
    subtitle: string;
    step1Title: string;
    consultationCost: string;
    payButton: string;
    payWithPaypal: string;
    redirectNotice: string;
    paymentDoneButton: string;
    step2Title: string;
    step2Instructions: string;
    goToCalendarButton: string;
    sendProofText: string;
    whatsappButton: string;
    emailButton: string;
    backButton: string;
  };
  serviceDetailModal: {
    overviewTitle: string;
    commonIssuesTitle: string;
    whatWeDoTitle: string;
    whyUsTitle: string;
    inclusiveSpaceTitle: string;
    paymentOptionsTitle: string;
    bookButton: string;
    askButton: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  serviceDetails?: {
    overview: string;
    commonIssues: string;
    services: string;
    benefits: string;
    lgbtFriendlyFocus: string;
    paymentOptions: string;
  };
}
