import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { google } from "googleapis";
import { MercadoPagoConfig, Preference } from "mercadopago";
import dotenv from "dotenv";
import { consultasDb, Consulta } from "./src/db/consultas_db";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// Google Calendar Security Side Setup & Integration (Lazy & Graceful)
// -----------------------------------------------------------------------------
let calendarClient: any = null;

function getCalendarClient() {
  if (calendarClient) return calendarClient;

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let key = process.env.GOOGLE_PRIVATE_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;

  if (!email || !key || !calendarId) {
    console.warn("[Calendar API] Note: Google Calendar configuration missing (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_CALENDAR_ID). Running in Simulation/Demo Mode.");
    return null;
  }

  try {
    if (key.includes("\\n")) {
      key = key.replace(/\\n/g, "\n");
    }

    const auth = new google.auth.JWT({
      email: email,
      key: key,
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/calendar.events"]
    });

    calendarClient = google.calendar({ version: "v3", auth });
    return calendarClient;
  } catch (error) {
    console.error("[Calendar API] Failed to initialize Google Calendar client:", error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Mercado Pago Client Initialization (Lazy & Graceful)
// -----------------------------------------------------------------------------
let mpConfig: MercadoPagoConfig | null = null;
function getMercadoPagoClient(): MercadoPagoConfig | null {
  if (mpConfig) return mpConfig;
  const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("[MercadoPago API] Note: MERCADO_PAGO_ACCESS_TOKEN is missing. Payments will use Checkout Simulator.");
    return null;
  }
  mpConfig = new MercadoPagoConfig({ accessToken });
  return mpConfig;
}

// -----------------------------------------------------------------------------
// PayPal Config & Security Helper (REST call)
// -----------------------------------------------------------------------------
function isPayPalConfigured() {
  return !!(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
}

async function getPayPalAccessToken(): Promise<string | null> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) return null;

  try {
    const auth64 = Buffer.from(`${clientId}:${secret}`).toString("base64");
    const response = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth64}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error(`Auth failed with status ${response.status}`);
    }

    const data: any = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("[PayPal API] OAuth retrieval error:", error);
    return null;
  }
}

// -----------------------------------------------------------------------------
// PAYMENTS ENDPOINTS
// -----------------------------------------------------------------------------

// Create payment preference or PayPal order
app.post("/api/payments/create", async (req, res) => {
  const { nombre_cliente, email_cliente, telefono_cliente, metodo_pago } = req.body;

  if (!nombre_cliente || !email_cliente || !telefono_cliente || !metodo_pago) {
    return res.status(400).json({ error: "Todos los campos (nombre, email, telefono, metodo_pago) son obligatorios." });
  }

  // Create temporary record in database
  const appUrl = (process.env.APP_URL || `http://localhost:${PORT}`).replace(/\/$/, "");
  
  // Unique database row
  const consulta = consultasDb.create({
    nombre_cliente,
    email_cliente,
    telefono_cliente,
    metodo_pago,
    paymentId: "pending_creation_" + Math.random().toString(36).substr(2, 5),
  });

  try {
    if (metodo_pago === "mercado_pago") {
      const mpClient = getMercadoPagoClient();
      if (mpClient) {
        // Real Preference Creation
        const preference = new Preference(mpClient);
        const refId = consulta.id;
        const bodyObj = {
          items: [
            {
              id: "consulta-legal",
              title: "Consulta Legal con Abogada Emilsen Marsicano",
              quantity: 1,
              unit_price: 50000,
              currency_id: "ARS"
            }
          ],
          back_urls: {
            success: `${appUrl}/api/payments/callback-success?consulta_id=${refId}`,
            failure: `${appUrl}/api/payments/callback-failure?consulta_id=${refId}`,
            pending: `${appUrl}/api/payments/callback-pending?consulta_id=${refId}`
          },
          auto_return: "approved" as const,
          external_reference: refId,
          notification_url: `${appUrl}/api/webhooks/mercadopago`,
          metadata: {
            consulta_id: refId
          }
        };

        const result = await preference.create({ body: bodyObj });
        consultasDb.update(consulta.id, { paymentId: result.id! });
        return res.json({ checkoutUrl: result.init_point, paymentId: result.id });
      } else {
        // MercadoPago Simulator for quick testing
        const simUrl = `${appUrl}/checkout-simulator/mercadopago?consulta_id=${consulta.id}`;
        consultasDb.update(consulta.id, { paymentId: consulta.id });
        return res.json({ checkoutUrl: simUrl, paymentId: consulta.id });
      }
    } else if (metodo_pago === "paypal") {
      if (isPayPalConfigured()) {
        const token = await getPayPalAccessToken();
        if (token) {
          // Real PayPal Order
          const refId = consulta.id;
          const orderBody = {
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: refId,
                amount: {
                  currency_code: "USD",
                  value: "50.00"
                },
                description: "Consulta Legal con Abogada Emilsen Marsicano"
              }
            ],
            application_context: {
              return_url: `${appUrl}/api/payments/paypal-return?consulta_id=${refId}`,
              cancel_url: `${appUrl}/api/payments/paypal-cancel?consulta_id=${refId}`
            }
          };

          const pResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(orderBody),
          });

          if (pResponse.ok) {
            const order: any = await pResponse.json();
            const approveUrl = order.links.find((l: any) => l.rel === "approve")?.href;
            consultasDb.update(consulta.id, { paymentId: order.id });
            return res.json({ checkoutUrl: approveUrl || appUrl, paymentId: order.id });
          }
        }
      }
      
      // PayPal Simulator
      const simUrl = `${appUrl}/checkout-simulator/paypal?consulta_id=${consulta.id}`;
      consultasDb.update(consulta.id, { paymentId: consulta.id });
      return res.json({ checkoutUrl: simUrl, paymentId: consulta.id });
    }

    return res.status(400).json({ error: "Método de pago no soportado" });
  } catch (error: any) {
    console.error("Payment create error:", error);
    res.status(500).json({ error: "Error de configuración de pasarela: " + error.message });
  }
});

// Retrieve payment and consulta verification status dynamically
app.get("/api/payments/status/:paymentId", (req, res) => {
  const { paymentId } = req.params;
  const consulta = consultasDb.getByPaymentId(paymentId) || consultasDb.getById(paymentId);
  if (!consulta) {
    return res.status(404).json({ error: "Pago o consulta no encontrado." });
  }

  res.json({
    consultaId: consulta.id,
    paymentId: consulta.paymentId,
    estado_pago: consulta.estado_pago,
    nombre_cliente: consulta.nombre_cliente,
    email_cliente: consulta.email_cliente,
    estado_consulta: consulta.estado_consulta,
    fecha_turno: consulta.fecha_turno,
    hora_turno: consulta.hora_turno,
    googleMeetLink: consulta.googleMeetLink
  });
});

// -----------------------------------------------------------------------------
// CALLBACKS & WEBHOOKS (Mercado Pago & PayPal real endpoints)
// -----------------------------------------------------------------------------

// MP Webhook
app.post("/api/webhooks/mercadopago", async (req, res) => {
  const event = req.body;
  console.log("[Webhook] MercadoPago:", JSON.stringify(event));

  // Confirm request from MP
  if (event?.type === "payment" && event?.data?.id) {
    const paymentId = event.data.id;
    const mpClient = getMercadoPagoClient();
    if (mpClient) {
      try {
        const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
          }
        });
        if (response.ok) {
          const rawPay = await response.json();
          const checkId = rawPay.external_reference;
          const status = rawPay.status;

          if (checkId && status === "approved") {
            consultasDb.update(checkId, {
              estado_pago: "approved",
              estado_consulta: "payment_approved",
              fecha_pago: new Date().toISOString()
            });
            console.log(`[Webhook] Approved status processed with external_ref: ${checkId}`);
          }
        }
      } catch (e) {
        console.error("MP Webhook retrieve failed:", e);
      }
    }
  }

  res.status(200).send("OK");
});

// MP redirects success
app.get("/api/payments/callback-success", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  const status = req.query.status as string;

  if (consultaId) {
    consultasDb.update(consultaId, {
      estado_pago: "approved",
      estado_consulta: "payment_approved",
      fecha_pago: new Date().toISOString()
    });
  }

  // Redirect back to application with booking ID and flag success
  const record = consultasDb.getById(consultaId);
  res.redirect(`/?payment_status=approved&payment_id=${record ? record.paymentId : ""}`);
});

app.get("/api/payments/callback-failure", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  if (consultaId) {
    consultasDb.update(consultaId, {
      estado_pago: "cancelled",
      estado_consulta: "pending_payment"
    });
  }
  res.redirect("/?payment_status=failed");
});

app.get("/api/payments/callback-pending", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  if (consultaId) {
    consultasDb.update(consultaId, {
      estado_pago: "pending",
      estado_consulta: "pending_payment"
    });
  }
  res.redirect("/?payment_status=pending");
});

// PayPal return capturing real completion
app.get("/api/payments/paypal-return", async (req, res) => {
  const token = req.query.token as string; // orderId matches token
  const consultaId = req.query.consulta_id as string;

  try {
    const accessToken = await getPayPalAccessToken();
    if (accessToken && token) {
      const captureResponse = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${token}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        }
      });

      if (captureResponse.ok) {
        const captureResult: any = await captureResponse.json();
        const stat = captureResult.status;

        if (stat === "COMPLETED") {
          consultasDb.update(consultaId, {
            estado_pago: "approved",
            estado_consulta: "payment_approved",
            fecha_pago: new Date().toISOString()
          });
          const record = consultasDb.getById(consultaId);
          return res.redirect(`/?payment_status=approved&payment_id=${record ? record.paymentId : ""}`);
        }
      }
    }
  } catch (error) {
    console.error("PayPal Capture failed:", error);
  }

  // Fallback to failure
  res.redirect("/?payment_status=failed");
});

app.get("/api/payments/paypal-cancel", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  if (consultaId) {
    consultasDb.update(consultaId, {
      estado_pago: "cancelled",
      estado_consulta: "pending_payment"
    });
  }
  res.redirect("/?payment_status=cancelled");
});


// -----------------------------------------------------------------------------
// CHECKOUT SIMULATORS (For beautiful interactive sandbox flow tests)
// -----------------------------------------------------------------------------
app.get("/checkout-simulator/mercadopago", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  const consulta = consultasDb.getById(consultaId);
  if (!consulta) {
    return res.status(404).send("<h2>Consulta no encontrada en la base de datos</h2>");
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Simulador de Pago - Mercado Pago</title>
    </head>
    <body class="bg-[#f5f5f5] min-h-screen flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-gray-150">
        <!-- Blue Mercado Pago top bar -->
        <div class="bg-[#009ee3] p-6 text-white text-center">
          <h1 class="text-xl font-bold tracking-tight">MERCADO PAGO</h1>
          <p class="text-xs text-blue-100 opacity-90 mt-1">Ambiente de Simulación Seguro</p>
        </div>

        <div class="p-8 space-y-6">
          <div class="border-b border-gray-100 pb-4 text-center">
            <p class="text-gray-500 text-xs uppercase tracking-wider font-semibold">Concepto</p>
            <p class="text-lg font-bold text-gray-850 mt-1">Consulta Legal con Abogada</p>
            <p class="text-gray-400 text-xs mt-1">Cliente: ${consulta.nombre_cliente}</p>
          </div>

          <div class="bg-blue-50/50 p-4 rounded-2xl text-center border border-blue-100/50">
            <p class="text-blue-500 text-xs font-semibold uppercase tracking-wide">Monto a pagar</p>
            <p class="text-3xl font-extrabold text-blue-600 mt-1">50.000 <span class="text-lg font-medium">ARS</span></p>
          </div>

          <!-- Simulation Actions -->
          <div class="space-y-3">
            <form action="/checkout-simulator/mercadopago/process" method="POST">
              <input type="hidden" name="consulta_id" value="${consultaId}" />
              <input type="hidden" name="action_status" value="approved" />
              <button type="submit" class="w-full bg-[#009ee3] hover:bg-[#008cc9] text-white font-bold rounded-2xl py-4 transition-all hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer">
                Simular Pago Aprobado (approved)
              </button>
            </form>

            <form action="/checkout-simulator/mercadopago/process" method="POST">
              <input type="hidden" name="consulta_id" value="${consultaId}" />
              <input type="hidden" name="action_status" value="rejected" />
              <button type="submit" class="w-full border-2 border-red-500/20 text-red-500 hover:bg-red-50 font-semibold rounded-2xl py-4 transition-all cursor-pointer">
                Rechazar Operación / Tarjeta inválida
              </button>
            </form>

            <form action="/checkout-simulator/mercadopago/process" method="POST">
              <input type="hidden" name="consulta_id" value="${consultaId}" />
              <input type="hidden" name="action_status" value="cancelled" />
              <button type="submit" class="w-full text-gray-400 hover:text-gray-650 text-sm py-2 hover:underline transition-all text-center block cursor-pointer">
                Cancelar y regresar
              </button>
            </form>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

app.post("/checkout-simulator/mercadopago/process", (req, res) => {
  const { consulta_id, action_status } = req.body;
  if (!consulta_id) return res.redirect("/");

  if (action_status === "approved") {
    consultasDb.update(consulta_id, {
      estado_pago: "approved",
      estado_consulta: "payment_approved",
      fecha_pago: new Date().toISOString()
    });
    // Redirect to MP Callback Success
    res.redirect(`/api/payments/callback-success?consulta_id=${consulta_id}&status=approved`);
  } else if (action_status === "rejected") {
    consultasDb.update(consulta_id, {
      estado_pago: "rejected"
    });
    res.redirect(`/api/payments/callback-failure?consulta_id=${consulta_id}`);
  } else {
    consultasDb.update(consulta_id, {
      estado_pago: "cancelled"
    });
    res.redirect(`/api/payments/callback-failure?consulta_id=${consulta_id}`);
  }
});

// PayPal Simulator UI
app.get("/checkout-simulator/paypal", (req, res) => {
  const consultaId = req.query.consulta_id as string;
  const consulta = consultasDb.getById(consultaId);
  if (!consulta) {
    return res.status(404).send("<h2>Consulta no encontrada en la base de datos</h2>");
  }

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Simulador de Pago - PayPal</title>
    </head>
    <body class="bg-[#fafbfd] min-h-screen flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl shadow-xl max-w-md w-full overflow-hidden border border-gray-150">
        <!-- PayPal branded top bar -->
        <div class="bg-[#003087] p-6 text-white text-center">
          <h1 class="text-xl font-bold tracking-tight">PayPal</h1>
          <p class="text-xs text-blue-200 opacity-90 mt-1">Ambiente de Simulación de Orden de Pago</p>
        </div>

        <div class="p-8 space-y-6">
          <div class="border-b border-gray-100 pb-4 text-center">
            <p class="text-gray-500 text-xs uppercase tracking-wider font-semibold">Concepto</p>
            <p class="text-lg font-bold text-gray-850 mt-1">Consulta Legal con Abogada</p>
            <p class="text-gray-400 text-xs mt-1">Cliente: ${consulta.nombre_cliente}</p>
          </div>

          <div class="bg-blue-50/50 p-4 rounded-2xl text-center border border-blue-100/50">
            <p class="text-[#0079C1] text-xs font-semibold uppercase tracking-wide">Monto total</p>
            <p class="text-3xl font-extrabold text-[#003087] mt-1">50.00 <span class="text-lg font-medium">USD</span></p>
          </div>

          <div class="space-y-3">
            <form action="/checkout-simulator/paypal/process" method="POST">
              <input type="hidden" name="consulta_id" value="${consultaId}" />
              <input type="hidden" name="action_status" value="completed" />
              <button type="submit" class="w-full bg-[#ffc439] hover:bg-[#e0ad32] text-slate-900 font-bold rounded-2xl py-4 transition-all hover:shadow-lg cursor-pointer">
                Simular Autorizar y Completar Pago
              </button>
            </form>

            <form action="/checkout-simulator/paypal/process" method="POST">
              <input type="hidden" name="consulta_id" value="${consultaId}" />
              <input type="hidden" name="action_status" value="cancelled" />
              <button type="submit" class="w-full text-gray-400 hover:text-gray-655 text-sm py-2 hover:underline transition-all text-center block cursor-pointer">
                Cancelar transacción y volver
              </button>
            </form>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  res.send(html);
});

app.post("/checkout-simulator/paypal/process", (req, res) => {
  const { consulta_id, action_status } = req.body;
  if (!consulta_id) return res.redirect("/");

  if (action_status === "completed") {
    consultasDb.update(consulta_id, {
      estado_pago: "approved",
      estado_consulta: "payment_approved",
      fecha_pago: new Date().toISOString()
    });
    res.redirect(`/api/payments/paypal-return?consulta_id=${consulta_id}&token=${consulta_id}`);
  } else {
    consultasDb.update(consulta_id, {
      estado_pago: "cancelled"
    });
    res.redirect(`/api/payments/paypal-cancel?consulta_id=${consulta_id}`);
  }
});


// -----------------------------------------------------------------------------
// AVAILABILITY & CALENDAR INTERACTION ENDPOINTS
// -----------------------------------------------------------------------------

// Read busy slots & return available slots block for selection
app.get("/api/calendar/availability", async (req, res) => {
  // Let's retrieve availability of next 14 weekdays (Mon-Fri)
  // Working hours: 09:00 - 18:00 (1 hour slots: 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00)
  const slotsConfig = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  
  const today = new Date();
  const availableSlots: { [dateStr: string]: string[] } = {};

  // Fetch from Google Calendar if configured
  const apiStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const apiEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 15).toISOString();

  let googleEvents: any[] = [];
  const client = getCalendarClient();
  if (client) {
    try {
      const response = await client.events.list({
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        timeMin: apiStart,
        timeMax: apiEnd,
        singleEvents: true,
        orderBy: "startTime",
      });
      googleEvents = response.data.items || [];
    } catch (e) {
      console.error("[Calendar API] Failed listing events:", e);
    }
  }

  // Fetch local booked consultations
  const localBooked = consultasDb.getAll().filter(c => c.estado_consulta === "scheduled" && c.fecha_turno && c.hora_turno);

  // Generate for the next 14 days
  let count = 0;
  let offset = 0;
  while (count < 10) { // Limit to 10 working days
    const currentDay = new Date();
    currentDay.setDate(today.getDate() + offset);
    offset++;

    const dayOfWeek = currentDay.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Skip weekends
      continue;
    }

    const year = currentDay.getFullYear();
    const month = String(currentDay.getMonth() + 1).padStart(2, "0");
    const day = String(currentDay.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    // Filter available slots
    const daySlots: string[] = [];
    for (const time of slotsConfig) {
      // 1. Check if slot overlaps with busy events in Google Calendar
      const currentSlotStart = new Date(`${dateStr}T${time}:00`).getTime();
      const currentSlotEnd = currentSlotStart + 60 * 60 * 1000;

      // Ensure booking is in the future
      if (currentSlotStart < Date.now()) {
        continue;
      }

      let isBusy = false;

      // Google check
      for (const event of googleEvents) {
        const evStart = new Date(event.start.dateTime || event.start.date).getTime();
        const evEnd = new Date(event.end.dateTime || event.end.date).getTime();
        // Overlap detection
        if (currentSlotStart < evEnd && currentSlotEnd > evStart) {
          isBusy = true;
          break;
        }
      }

      // Local db duplicate booking check
      if (!isBusy) {
        const isLocallyBooked = localBooked.some(
          b => b.fecha_turno === dateStr && b.hora_turno === time
        );
        if (isLocallyBooked) {
          isBusy = true;
        }
      }

      if (!isBusy) {
        daySlots.push(time);
      }
    }

    if (daySlots.length > 0) {
      availableSlots[dateStr] = daySlots;
      count++;
    }
  }

  res.json({ availableSlots });
});

// Create Google Calendar event after payment validation
app.post("/api/calendar/create-event", async (req, res) => {
  const { paymentId, fecha_turno, hora_turno } = req.body;

  if (!paymentId || !fecha_turno || !hora_turno) {
    return res.status(400).json({ error: "Faltan parámetros obligatorios (paymentId, fecha_turno, hora_turno)." });
  }

  // Look up consulta using paymentId
  const consulta = consultasDb.getByPaymentId(paymentId) || consultasDb.getById(paymentId);
  if (!consulta) {
    return res.status(404).json({ error: "No se encontró registro de consulta para la reserva." });
  }

  // SECURITY FIRST: Verify payment was approved in backend before allowing booking!
  if (consulta.estado_pago !== "approved") {
    return res.status(403).json({ error: "No se admite reserva para transacciones pendientes de pago." });
  }

  try {
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    const client = getCalendarClient();

    let eventId = "mock_evt_" + Math.random().toString(36).substr(2, 9);
    let meetLink = `https://meet.google.com/abc-defg-hij`;

    if (client && calendarId) {
      // Integrate actual Google Calendar meeting event creation
      const startDateTime = `${fecha_turno}T${hora_turno}:00`;
      
      // Calculate endTime (1 hour later)
      const [hours, mins] = hora_turno.split(":").map(Number);
      const endHours = String(hours + 1).padStart(2, "0");
      const endDateTime = `${fecha_turno}T${endHours}:${mins}:00`;

      const eventBody = {
        summary: `Consulta Legal - ${consulta.nombre_cliente}`,
        description: `Consulta legal pagada y confirmada.\n\nNombre: ${consulta.nombre_cliente}\nEmail: ${consulta.email_cliente}\nTeléfono: ${consulta.telefono_cliente}\nPayment ID: ${consulta.paymentId}`,
        start: {
          dateTime: startDateTime,
          timeZone: "America/Argentina/Buenos_Aires"
        },
        end: {
          dateTime: endDateTime,
          timeZone: "America/Argentina/Buenos_Aires"
        },
        attendees: [
          { email: consulta.email_cliente },
          { email: calendarId } // Include lawyer explicitly
        ],
        conferenceData: {
          createRequest: {
            requestId: `meet_req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            conferenceSolutionKey: {
              type: "hangoutsMeet"
            }
          }
        }
      };

      const calendarRes = await client.events.insert({
        calendarId: calendarId,
        requestBody: eventBody,
        conferenceDataVersion: 1
      });

      if (calendarRes.data.id) {
        eventId = calendarRes.data.id;
        meetLink = calendarRes.data.conferenceData?.entryPoints?.[0]?.uri || `https://meet.google.com/meet-${eventId}`;
      }
    } else {
      console.log(`[Calendar Mock] Automatically scheduled Simulated Google Meet and calendar details for: ${consulta.nombre_cliente}`);
    }

    // Update Db record
    consultasDb.update(consulta.id, {
      fecha_turno,
      hora_turno,
      googleCalendarEventId: eventId,
      googleMeetLink: meetLink,
      estado_consulta: "scheduled"
    });

    const updatedConsulta = consultasDb.getById(consulta.id)!;

    // Email simulation note
    console.log(`[Email Alert] Sending legal session confirmation to: ${consulta.email_cliente} containing meeting link: ${meetLink}`);

    return res.json({
      success: true,
      consulta: updatedConsulta
    });
  } catch (error: any) {
    console.error("Calendar creation failed:", error);
    res.status(500).json({ error: "Surgió un error al contactar al calendario: " + error.message });
  }
});


// -----------------------------------------------------------------------------
// VITE CLIENT MIDDLEWARE & DEV SERVER RUNTIME
// -----------------------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-Stack App] Running on absolute port ${PORT}`);
    console.log(`[Database Ready] Pre-seeded file layer activated.`);
  });
}

start();
