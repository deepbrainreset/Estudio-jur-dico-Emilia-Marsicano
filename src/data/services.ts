import {
  Scale,
  Users,
  Building,
  Heart,
  Home,
  Shield,
  PawPrint,
  Car,
  FileText
} from "lucide-react";
import { Service } from "../types";

export const servicesData: Service[] = [
  {
    id: "civil",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715341/Civil_jhynp8.png",
    modalIcon: Scale,
    title: "services.civil.title",
    description: "services.civil.description",
    details: {
      overview: "services.civil.details.overview",
      commonIssues: [
        "services.civil.details.commonIssues.0",
        "services.civil.details.commonIssues.1",
        "services.civil.details.commonIssues.2",
        "services.civil.details.commonIssues.3",
        "services.civil.details.commonIssues.4"
      ],
      services: [
        "services.civil.details.services.0",
        "services.civil.details.services.1",
        "services.civil.details.services.2",
        "services.civil.details.services.3",
        "services.civil.details.services.4"
      ],
      benefits: "services.civil.details.benefits",
      lgbtFriendlyFocus: "services.civil.details.lgbtFriendlyFocus",
      paymentOptions: "services.civil.details.paymentOptions"
    }
  },
  {
    id: "family",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715347/Familia_ckck0g.png",
    modalIcon: Users,
    title: "services.family.title",
    description: "services.family.description",
    details: {
      overview: "services.family.details.overview",
      commonIssues: [
        "services.family.details.commonIssues.0",
        "services.family.details.commonIssues.1",
        "services.family.details.commonIssues.2",
        "services.family.details.commonIssues.3",
        "services.family.details.commonIssues.4"
      ],
      services: [
        "services.family.details.services.0",
        "services.family.details.services.1",
        "services.family.details.services.2",
        "services.family.details.services.3",
        "services.family.details.services.4"
      ],
      benefits: "services.family.details.benefits",
      lgbtFriendlyFocus: "services.family.details.lgbtFriendlyFocus",
      paymentOptions: "services.family.details.paymentOptions"
    }
  },
  {
    id: "commercial",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715343/Comercial_eqxjqo.png",
    modalIcon: Building,
    title: "services.commercial.title",
    description: "services.commercial.description",
    details: {
      overview: "services.commercial.details.overview",
      commonIssues: [
        "services.commercial.details.commonIssues.0",
        "services.commercial.details.commonIssues.1",
        "services.commercial.details.commonIssues.2",
        "services.commercial.details.commonIssues.3",
        "services.commercial.details.commonIssues.4"
      ],
      services: [
        "services.commercial.details.services.0",
        "services.commercial.details.services.1",
        "services.commercial.details.services.2",
        "services.commercial.details.services.3",
        "services.commercial.details.services.4"
      ],
      benefits: "services.commercial.details.benefits",
      lgbtFriendlyFocus: "services.commercial.details.lgbtFriendlyFocus",
      paymentOptions: "services.commercial.details.paymentOptions"
    }
  },
  {
    id: "labor",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715348/Laboral_qztowq.png",
    modalIcon: Heart,
    title: "services.labor.title",
    description: "services.labor.description",
    details: {
      overview: "services.labor.details.overview",
      commonIssues: [
        "services.labor.details.commonIssues.0",
        "services.labor.details.commonIssues.1",
        "services.labor.details.commonIssues.2",
        "services.labor.details.commonIssues.3",
        "services.labor.details.commonIssues.4"
      ],
      services: [
        "services.labor.details.services.0",
        "services.labor.details.services.1",
        "services.labor.details.services.2",
        "services.labor.details.services.3",
        "services.labor.details.services.4"
      ],
      benefits: "services.labor.details.benefits",
      lgbtFriendlyFocus: "services.labor.details.lgbtFriendlyFocus",
      paymentOptions: "services.labor.details.paymentOptions"
    }
  },
  {
    id: "real-estate",
    icon: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
    modalIcon: Home,
    title: "services.real_estate.title",
    description: "services.real_estate.description",
    details: {
      overview: "services.real_estate.details.overview",
      commonIssues: [
        "services.real_estate.details.commonIssues.0",
        "services.real_estate.details.commonIssues.1",
        "services.real_estate.details.commonIssues.2",
        "services.real_estate.details.commonIssues.3",
        "services.real_estate.details.commonIssues.4"
      ],
      services: [
        "services.real_estate.details.services.0",
        "services.real_estate.details.services.1",
        "services.real_estate.details.services.2",
        "services.real_estate.details.services.3",
        "services.real_estate.details.services.4"
      ],
      benefits: "services.real_estate.details.benefits",
      lgbtFriendlyFocus: "services.real_estate.details.lgbtFriendlyFocus",
      paymentOptions: "services.real_estate.details.paymentOptions"
    }
  },
  {
    id: "criminal",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715347/Penal_g3zhxp.png",
    modalIcon: Shield,
    title: "services.criminal.title",
    description: "services.criminal.description",
    details: {
      overview: "services.criminal.details.overview",
      commonIssues: [
        "services.criminal.details.commonIssues.0",
        "services.criminal.details.commonIssues.1",
        "services.criminal.details.commonIssues.2",
        "services.criminal.details.commonIssues.3",
        "services.criminal.details.commonIssues.4"
      ],
      services: [
        "services.criminal.details.services.0",
        "services.criminal.details.services.1",
        "services.criminal.details.services.2",
        "services.criminal.details.services.3",
        "services.criminal.details.services.4"
      ],
      benefits: "services.criminal.details.benefits",
      lgbtFriendlyFocus: "services.criminal.details.lgbtFriendlyFocus",
      paymentOptions: "services.criminal.details.paymentOptions"
    }
  },
  {
    id: "animal",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715341/Animal_fkjief.png",
    modalIcon: PawPrint,
    title: "services.animal.title",
    description: "services.animal.description",
    details: {
      overview: "services.animal.details.overview",
      commonIssues: [
        "services.animal.details.commonIssues.0",
        "services.animal.details.commonIssues.1",
        "services.animal.details.commonIssues.2",
        "services.animal.details.commonIssues.3",
        "services.animal.details.commonIssues.4"
      ],
      services: [
        "services.animal.details.services.0",
        "services.animal.details.services.1",
        "services.animal.details.services.2",
        "services.animal.details.services.3",
        "services.animal.details.services.4"
      ],
      benefits: "services.animal.details.benefits",
      lgbtFriendlyFocus: null,
      paymentOptions: "services.animal.details.paymentOptions"
    }
  },
  {
    id: "automotor",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715342/Auto_mnho92.png",
    modalIcon: Car,
    title: "services.automotor.title",
    description: "services.automotor.description",
    details: {
      overview: "services.automotor.details.overview",
      commonIssues: [
        "services.automotor.details.commonIssues.0",
        "services.automotor.details.commonIssues.1",
        "services.automotor.details.commonIssues.2",
        "services.automotor.details.commonIssues.3",
        "services.automotor.details.commonIssues.4"
      ],
      services: [
        "services.automotor.details.services.0",
        "services.automotor.details.services.1",
        "services.automotor.details.services.2",
        "services.automotor.details.services.3",
        "services.automotor.details.services.4"
      ],
      benefits: "services.automotor.details.benefits",
      lgbtFriendlyFocus: null,
      paymentOptions: "services.automotor.details.paymentOptions"
    }
  },
  {
    id: "escribania",
    icon: "https://res.cloudinary.com/dyzedavsd/image/upload/v1779715346/Escribania_hm3zbz.png",
    modalIcon: FileText,
    title: "services.escribania.title",
    description: "services.escribania.description",
    details: {
      overview: "services.escribania.details.overview",
      commonIssues: [
        "services.escribania.details.commonIssues.0",
        "services.escribania.details.commonIssues.1",
        "services.escribania.details.commonIssues.2",
        "services.escribania.details.commonIssues.3",
        "services.escribania.details.commonIssues.4"
      ],
      services: [
        "services.escribania.details.services.0",
        "services.escribania.details.services.1",
        "services.escribania.details.services.2",
        "services.escribania.details.services.3",
        "services.escribania.details.services.4"
      ],
      benefits: "services.escribania.details.benefits",
      lgbtFriendlyFocus: "services.escribania.details.lgbtFriendlyFocus",
      paymentOptions: "services.escribania.details.paymentOptions"
    }
  }
];
