import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ArrowRight,
  ExternalLink,
  Calendar,
  Check,
  Phone,
  Mail,
  User,
  Clock,
  AlertCircle
} from "lucide-react";
import { useLanguage } from "./LanguageContext";

interface BookingModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function BookingModal({ isOpen, setIsOpen }: BookingModalProps) {
  const { t } = useLanguage();

  // Booking details form states
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodoPago, setMetodoPago] = useState<"mercado_pago" | "paypal">("mercado_pago");

  // Flow steps:
  // 1 = Form entry
  // 2 = Payment processing check (polls status)
  // 3 = Choose date and hour slot
  // 4 = Final reservation details success screen
  const [step, setStep] = useState<number>(1);

  // API states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "approved" | "rejected" | "cancelled"
  >("pending");
  const [checkoutUrl, setCheckoutUrl] = useState<string>("");

  // Availability calendar states
  const [availableSlots, setAvailableSlots] = useState<{ [date: string]: string[] }>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isReserving, setIsReserving] = useState(false);
  const [finalMeetingDetails, setFinalMeetingDetails] = useState<any | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Detect query params on search on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pStatus = params.get("payment_status");
    const pId = params.get("payment_id");

    if (pStatus === "approved" && pId) {
      setPaymentId(pId);
      setPaymentStatus("approved");
      setStep(3); // Go straight to slots step!
      setIsOpen(true);
      fetchAvailableSlots();
    } else if (pStatus === "cancelled" || pStatus === "failed") {
      setPaymentStatus("rejected");
      setStep(2);
      setIsOpen(true);
    }
  }, []);

  // Poll for payment approval if we are in step 2 (Waiting for payment)
  useEffect(() => {
    if (step === 2 && paymentId && paymentStatus !== "approved") {
      setPaymentStatus("processing");
      
      // Start polling
      pollIntervalRef.current = setInterval(() => {
        checkPaymentStatus(paymentId);
      }, 3000);
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [step, paymentId]);

  // Clean form when modal closes
  const handleClose = () => {
    setIsOpen(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    setTimeout(() => {
      setStep(1);
      setNombre("");
      setEmail("");
      setTelefono("");
      setPaymentId(null);
      setPaymentStatus("pending");
      setSelectedDate("");
      setSelectedTime("");
      setFinalMeetingDetails(null);
    }, 300);
  };

  // 1. Check payment status from backend
  const checkPaymentStatus = async (pId: string) => {
    try {
      const res = await fetch(`/api/payments/status/${pId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.estado_pago === "approved") {
          setPaymentStatus("approved");
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
          }
          // Fetch calendar availability
          fetchAvailableSlots();
          setStep(3); // Advance to datepicker step automatically!
        } else if (data.estado_pago === "rejected" || data.estado_pago === "cancelled") {
          setPaymentStatus("rejected");
        }
      }
    } catch (error) {
      console.error("Error verifying payment status:", error);
    }
  };

  // 2. Fetch available slots from backend google calendar / local db
  const fetchAvailableSlots = async () => {
    setLoadingSlots(true);
    try {
      const res = await fetch("/api/calendar/availability");
      if (res.ok) {
        const data = await res.json();
        setAvailableSlots(data.availableSlots || {});
        
        // Select first available date by default
        const dates = Object.keys(data.availableSlots || {});
        if (dates.length > 0) {
          setSelectedDate(dates[0]);
        }
      }
    } catch (e) {
      console.error("Error fetching slots:", e);
    } finally {
      setLoadingSlots(false);
    }
  };

  // 3. Form Submission - Create Checkout URL
  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !telefono.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_cliente: nombre,
          email_cliente: email,
          telefono_cliente: telefono,
          metodo_pago: metodoPago,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentId(data.paymentId);
        setCheckoutUrl(data.checkoutUrl);
        setPaymentStatus("pending");
        
        // Redirect to preference checkout in a new window/tab
        window.open(data.checkoutUrl, "_blank");
        
        // Push step state to status pooling
        setStep(2);
      } else {
        const errData = await res.json();
        alert("Error al iniciar checkout: " + (errData.error || "Error desconocido"));
      }
    } catch (error) {
      console.error("Checkout initiation failed:", error);
      alert("Error temporario con la pasarela de pagos. Por favor intente más tarde.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Booking Scheduler Submission - Save Appointment
  const handleConfirmReservation = async () => {
    if (!paymentId || !selectedDate || !selectedTime) return;

    setIsReserving(true);
    try {
      const res = await fetch("/api/calendar/create-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: paymentId,
          fecha_turno: selectedDate,
          hora_turno: selectedTime,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setFinalMeetingDetails(data.consulta);
          setStep(4); // Show final confirmation screen
        } else {
          alert("No se pudo reservar el turno. Por favor intente con otro horario.");
        }
      } else {
        const err = await res.json();
        alert("Error al confirmar reserva: " + (err.error || "Disponibilidad agotada"));
      }
    } catch (error) {
      console.error("Confirm booking failed:", error);
      alert("Error de conexión. Intente nuevamente.");
    } finally {
      setIsReserving(false);
    }
  };

  // Format date helper (e.g., "Miér, 11 Jun")
  const formatDateFriendly = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-background rounded-3xl shadow-2xl w-full max-w-xl relative border border-border overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dark abstract accent background ornament */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-primary to-amber-600" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary cursor-pointer z-10"
              id="close-booking-modal-btn"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
                {t("bookingModal.title")}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                Flujo automatizado de agendamiento de asesoría legal
              </p>

              <div className="relative">
                <AnimatePresence mode="wait">
                  {/* STEP 1: Form Customer Details */}
                  {step === 1 && (
                    <motion.form
                      key="step1"
                      onSubmit={handleInitiatePayment}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-5"
                    >
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start space-x-3 text-sm text-balance">
                        <span className="text-amber-500 mt-0.5 font-bold">⚠️</span>
                        <p className="text-muted-foreground">
                          Para reservar su consulta, ingrese sus datos, complete el abono de honorarios de forma segura e inmediatamente se habilitará el selector de turnos en tiempo real con Google Calendar.
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                            Nombre y Apellido completo *
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                              <User size={16} />
                            </span>
                            <input
                              type="text"
                              required
                              value={nombre}
                              onChange={(e) => setNombre(e.target.value)}
                              placeholder="Ej. Juan Pérez"
                              className="w-full bg-secondary border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              Correo electrónico *
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Mail size={16} />
                              </span>
                              <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="juan@email.com"
                                className="w-full bg-secondary border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                              Teléfono / WhatsApp *
                            </label>
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                                <Phone size={16} />
                              </span>
                              <input
                                type="tel"
                                required
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                placeholder="Ej. +54 9 11 1234 5678"
                                className="w-full bg-secondary border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cost breakdown */}
                      <div className="bg-secondary/70 p-4 rounded-2xl border border-border flex justify-between items-center">
                        <div>
                          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">Honorarios de Consulta</p>
                          <p className="text-sm font-semibold text-foreground mt-0.5">Asesoría Profesional Legal (1 hora)</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-foreground">50.000 <span className="text-xs font-medium">ARS</span></p>
                          <p className="text-[10px] text-muted-foreground">o equivalente en USD</p>
                        </div>
                      </div>

                      {/* Payment Method Selector */}
                      <div className="space-y-2">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Seleccione Pasarela de Pago Seguro
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => setMetodoPago("mercado_pago")}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              metodoPago === "mercado_pago"
                                ? "border-sky-500 bg-sky-500/5 text-sky-500"
                                : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            <span className="font-bold text-sm">Mercado Pago</span>
                            <span className="text-[10px] opacity-85 mt-1">Soporta Tarjetas y Pesos</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setMetodoPago("paypal")}
                            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              metodoPago === "paypal"
                                ? "border-amber-500 bg-amber-500/5 text-amber-500"
                                : "border-border hover:border-muted-foreground/30 text-muted-foreground"
                            }`}
                          >
                            <span className="font-bold text-sm">PayPal</span>
                            <span className="text-[10px] opacity-85 mt-1">Soporta USD / Exterior</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-2xl py-4 flex items-center justify-center transition-all cursor-pointer shadow-lg shadow-primary/15"
                      >
                        {isSubmitting ? "Iniciando pasarela de pago..." : "Ir a pagar de forma segura"}
                        <ArrowRight size={18} className="ml-2 animate-pulse" />
                      </button>
                    </motion.form>
                  )}

                  {/* STEP 2: Payment dynamic verification */}
                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-8 space-y-6"
                    >
                      {/* Dynamic States Representation */}
                      <div className="flex flex-col items-center justify-center">
                        {paymentStatus === "processing" && (
                          <div className="w-16 h-16 rounded-full border-4 border-primary/25 border-t-primary animate-spin mb-4" />
                        )}
                        {paymentStatus === "pending" && (
                          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 mb-4 animate-pulse">
                            <Clock size={32} />
                          </div>
                        )}
                        {paymentStatus === "rejected" && (
                          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-4">
                            <AlertCircle size={32} />
                          </div>
                        )}

                        <span className="text-xs font-bold uppercase tracking-widest text-[#cf762e] bg-[#cf762e]/10 px-3 py-1 rounded-full">
                          {paymentStatus === "pending" && "Pendiente de pago"}
                          {paymentStatus === "processing" && "Procesando pago…"}
                          {paymentStatus === "rejected" && "Pago rechazado o cancelado"}
                        </span>

                        <h3 className="text-xl font-bold text-foreground mt-4">
                          {paymentStatus === "pending" && "Esperando confirmación del pago"}
                          {paymentStatus === "processing" && "Verificando acreditación..."}
                          {paymentStatus === "rejected" && "La pasarela no pudo procesar tu pago"}
                        </h3>

                        <p className="text-sm text-balance text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                          {paymentStatus === "pending" && "Hemos abierto una pestaña para efectuar el abono. Una vez finalizada la confirmación de pago, esta pantalla avanzará automáticamente."}
                          {paymentStatus === "processing" && "Consultando el estado de la transacción de forma segura directamente con la entidad procesadora del backend..."}
                          {paymentStatus === "rejected" && "Hubo un inconveniente para deitar los fondos o cancelaste el checkout de pago. Por favor intente más tarde."}
                        </p>
                      </div>

                      {/* Re-opening link just in case */}
                      {paymentStatus !== "approved" && (
                        <div className="bg-secondary p-4 rounded-2xl max-w-sm mx-auto space-y-3">
                          <p className="text-xs text-muted-foreground font-medium">¿Se cerró la pasarela de pago?</p>
                          <a
                            href={checkoutUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-semibold text-primary hover:underline hover:text-primary/90 cursor-pointer"
                          >
                            Abrir plataforma de pago nuevamente
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        </div>
                      )}

                      <div className="flex flex-col space-y-2 max-w-xs mx-auto">
                        {paymentStatus === "rejected" && (
                          <button
                            onClick={() => setStep(1)}
                            className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-2xl py-3 cursor-pointer transition-colors"
                          >
                            Reintentar Formulario / Cambiar medio de pago
                          </button>
                        )}
                        <button
                          onClick={handleClose}
                          className="text-muted-foreground hover:text-foreground text-xs py-2 hover:underline cursor-pointer"
                        >
                          Cancelar reserva de consulta
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Date and Hour selector */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {/* Positive checked banner */}
                      <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-sm text-green-500 font-semibold">
                          <Check size={20} className="stroke-[3]" />
                          <span>¡Pago aprobado y verificado!</span>
                        </div>
                        <span className="text-[11px] font-bold text-muted-foreground tracking-wide uppercase bg-secondary px-3 py-1 rounded-full border border-border">
                          Ahora podés elegir tu turno
                        </span>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Selección de Fecha de Consulta
                        </label>

                        {loadingSlots ? (
                          <div className="flex flex-col items-center justify-center p-12 space-y-3">
                            <div className="w-10 h-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
                            <p className="text-xs text-muted-foreground">Cargando agenda de turnos en tiempo real con Google Calendar...</p>
                          </div>
                        ) : Object.keys(availableSlots).length === 0 ? (
                          <div className="text-center p-8 bg-secondary rounded-2xl space-y-2">
                            <p className="text-sm font-semibold text-foreground">No hay turnos disponibles próximamente</p>
                            <p className="text-xs text-muted-foreground">La abogada no tiene franjas horarias libres actualmente. Por favor contáctenos por WhatsApp para un horario de emergencia.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {/* Calendar columns (Dates) */}
                            <div className="md:col-span-2 space-y-2">
                              {Object.keys(availableSlots).map((date) => (
                                <button
                                  key={date}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDate(date);
                                    setSelectedTime(""); // Reset selected hour
                                  }}
                                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all focus:outline-none cursor-pointer flex justify-between items-center ${
                                    selectedDate === date
                                      ? "border-primary bg-primary/10 text-primary font-bold"
                                      : "border-border hover:border-muted-foreground/30 text-muted-foreground hover:-translate-y-0.5"
                                  }`}
                                >
                                  <span>{formatDateFriendly(date)}</span>
                                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    selectedDate === date
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-secondary text-muted-foreground"
                                  }`}>
                                    {availableSlots[date].length} libre{availableSlots[date].length > 1 ? "s" : ""}
                                  </span>
                                </button>
                              ))}
                            </div>

                            {/* Hours list side panel */}
                            <div className="md:col-span-3 border border-border rounded-2xl p-4 bg-secondary/30 min-h-[220px] flex flex-col">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                Horarios disponibles ({formatDateFriendly(selectedDate)})
                              </p>

                              {selectedDate && availableSlots[selectedDate] && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[180px] pr-1">
                                  {availableSlots[selectedDate].map((time) => (
                                    <button
                                      key={time}
                                      type="button"
                                      onClick={() => setSelectedTime(time)}
                                      className={`p-2.5 rounded-lg border text-xs text-center font-semibold transition-all cursor-pointer focus:outline-none ${
                                        selectedTime === time
                                          ? "border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/10"
                                          : "border-border bg-background hover:border-muted-foreground/30 text-foreground"
                                      }`}
                                    >
                                      {time} hs
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-border pt-4 flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={handleConfirmReservation}
                          disabled={!selectedDate || !selectedTime || isReserving}
                          className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-2xl py-4 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/15 order-last sm:order-first"
                        >
                          <Calendar size={18} className="mr-2" />
                          {isReserving ? "Agendando consulta en Google Calendar..." : "Confirmar fecha y reservar"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 4: Event successfully created on google calendar with meet link */}
                  {step === 4 && finalMeetingDetails && (
                    <motion.div
                      key="step4"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="text-center py-6 space-y-6"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 mb-4 scale-in">
                          <Check size={36} className="stroke-[3]" />
                        </div>
                        <h3 className="text-2xl font-extrabold text-foreground">¡Cita agendada correctamente!</h3>
                        <p className="text-sm text-balance text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                          Se ha registrado y creado el evento en Google Calendar. También hemos enviado una confirmación a su correo electrónico.
                        </p>
                      </div>

                      {/* Display meeting card */}
                      <div className="bg-secondary rounded-2xl p-6 text-left border border-border space-y-4 max-w-md mx-auto">
                        <div className="border-b border-border pb-3 flex justify-between items-center">
                          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sesión de Consulta Legal</p>
                          <span className="text-[10px] bg-green-500/10 text-green-500 font-bold px-2 py-0.5 rounded-full border border-green-500/20">
                            Confirmada
                          </span>
                        </div>

                        <div className="space-y-3">
                          <p className="text-sm font-semibold text-foreground flex items-center">
                            <span className="text-amber-500 mr-2.5">👤</span>
                            Abogada: Emilsen Marsicano
                          </p>

                          <p className="text-sm text-foreground flex items-center">
                            <span className="text-amber-500 mr-2.5">📅</span>
                            Día: {formatDateFriendly(finalMeetingDetails.fecha_turno)}
                          </p>

                          <p className="text-sm text-foreground flex items-center">
                            <span className="text-amber-500 mr-2.5">⏰</span>
                            Horario: {finalMeetingDetails.hora_turno} hs (Franja de 1 Hora)
                          </p>

                          <p className="text-sm text-foreground flex items-center">
                            <span className="text-amber-500 mr-2.5">📧</span>
                            Cliente: {finalMeetingDetails.email_cliente}
                          </p>
                        </div>

                        <div className="bg-background rounded-xl p-4 border border-border space-y-2 mt-4 text-center">
                          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Sala de Reunión por Google Meet</p>
                          <a
                            href={finalMeetingDetails.googleMeetLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-primary text-primary-foreground font-bold hover:scale-[1.02] text-sm py-2 px-5 rounded-lg inline-flex items-center transition-all cursor-pointer shadow-md shadow-primary/10 mt-1"
                          >
                            Unirse a Google Meet
                            <ExternalLink size={14} className="ml-2" />
                          </a>
                          <p className="text-[10px] text-muted-foreground italic truncate max-w-xs mx-auto">
                            {finalMeetingDetails.googleMeetLink}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleClose}
                        className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl py-3.5 px-8 inline-block cursor-pointer transition-all shadow-lg shadow-primary/10"
                      >
                        Entendido, cerrar
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
