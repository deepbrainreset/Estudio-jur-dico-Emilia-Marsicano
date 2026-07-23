import React, { useState } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { ArrowRight, FileText } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { Service } from "../types";

interface ServicesSectionProps {
  services: Service[];
  handleServiceClick: (service: Service) => void;
}

interface ServiceCardProps {
  key?: React.Key;
  service: Service;
  index: number;
  handleServiceClick: (service: Service) => void;
}

function ServiceCard({ service, index, handleServiceClick }: ServiceCardProps) {
  const { t } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  // Mouse position values normalized to 1 unit
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Create standard responsive 3D tilt angles (-7 to 7 degrees looks best and elegant)
  const rotateX = useTransform(y, [-0.5, 0.5], [7, -7]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-7, 7]);

  // Spring animations for buttery, delay-free reactivity
  const springConfig = { damping: 22, stiffness: 160, mass: 0.55 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Translate vectors for elevation (lifting card closer in Z)
  const translateZCard = useSpring(0, springConfig);
  // Image zoom and Z depth for true 3D parallax layers
  const imgScale = useSpring(1.0, springConfig);
  const imgZ = useSpring(0, springConfig);

  // Text items float depth
  const textZ = useSpring(0, springConfig);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    translateZCard.set(15);
    imgScale.set(1.15); // zooms and brings the image closer
    imgZ.set(40);       // moves the picture on its independent 3D plane
    textZ.set(25);      // lifts texts out
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
    translateZCard.set(0);
    imgScale.set(1.0);
    imgZ.set(0);
    textZ.set(0);
  };

  const Icon = service.modalIcon || FileText;
  const title = t(service.title);
  const desc = t(service.description);

  return (
    <div id={service.id} style={{ perspective: 1200 }} className="h-full py-2">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          z: translateZCard,
          transformStyle: "preserve-3d"
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="service-card rounded-2xl overflow-hidden cursor-pointer flex flex-col group relative h-full bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/60 transition-colors duration-300 shadow-xl"
        onClick={() => handleServiceClick(service)}
      >
        {/* Draw border stroke animation covering card, thin elegant orange line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl z-30" style={{ transformStyle: "preserve-3d", translateZ: "20px" }}>
          <motion.rect
            x="1"
            y="1"
            width="calc(100% - 2px)"
            height="calc(100% - 2px)"
            rx="16"
            ry="16"
            fill="none"
            stroke="#ff9d42" /* Subtle warm orange */
            strokeWidth="1.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>

        {/* Dynamic Light flare covering the cover on hovered cursor */}
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#ff9d42]/3 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
          style={{ transformStyle: "preserve-3d", translateZ: "10px" }}
        />

        {/* Banner image with internal 3D Parallax stage */}
        <div 
          className="w-full aspect-video bg-gradient-to-br from-primary/15 to-transparent flex items-center justify-center overflow-hidden relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div 
            className="w-full h-full relative" 
            style={{ 
              scale: imgScale, 
              translateZ: imgZ, 
              transformStyle: "preserve-3d" 
            }}
          >
            {typeof service.icon === "string" && service.icon.startsWith("http") ? (
              <img
                src={service.icon}
                alt={title}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                <Icon className="w-16 h-16 text-primary/85" />
              </div>
            )}
          </motion.div>
          {/* Accent light layer */}
          <div className="absolute inset-0 bg-primary/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Details and Description Box */}
        <div 
          className="p-8 flex flex-col flex-grow relative"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.h3 
            className="text-2xl font-serif font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300"
            style={{ translateZ: textZ }}
          >
            {title}
          </motion.h3>
          <motion.p 
            className="text-muted-foreground mb-6 leading-relaxed flex-grow line-clamp-3 text-sm font-sans"
            style={{ translateZ: "10px" }}
          >
            {desc}
          </motion.p>
          <motion.div 
            className="flex items-center text-primary font-semibold mt-auto"
            style={{ translateZ: "15px" }}
          >
            <span className="text-sm tracking-wide">{t("services.detailsButton")}</span>
            <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1.5" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

export default function ServicesSection({ services, handleServiceClick }: ServicesSectionProps) {
  const { t } = useLanguage();

  return (
    <section id="servicios" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight gradient-text mb-6 py-2 leading-tight">
            {t("services.title")}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("services.subtitle")}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={index}
              handleServiceClick={handleServiceClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
