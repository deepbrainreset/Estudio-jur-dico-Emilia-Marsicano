import fs from "fs";
import path from "path";

export interface Consulta {
  id: string; // Unique simulation ID or database ID
  nombre_cliente: string;
  email_cliente: string;
  telefono_cliente: string;
  metodo_pago: "mercado_pago" | "paypal";
  paymentId: string; // MercadoPago preference_id or PayPal order_id
  estado_pago: "pending" | "approved" | "rejected" | "cancelled";
  fecha_pago?: string;
  fecha_turno?: string;
  hora_turno?: string;
  googleCalendarEventId?: string;
  googleMeetLink?: string;
  estado_consulta: "pending_payment" | "payment_approved" | "scheduled" | "cancelled";
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "consultas.json");

// Cache for operations
let inMemoryConsultas: Consulta[] = [];

// Initialize database
function initDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(FILE_PATH)) {
      const raw = fs.readFileSync(FILE_PATH, "utf-8");
      inMemoryConsultas = JSON.parse(raw);
    } else {
      fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), "utf-8");
      inMemoryConsultas = [];
    }
  } catch (error) {
    console.error("Error initializing database, using in-memory fallback:", error);
    inMemoryConsultas = [];
  }
}

initDb();

export const consultasDb = {
  getAll(): Consulta[] {
    return inMemoryConsultas;
  },

  getById(id: string): Consulta | undefined {
    return inMemoryConsultas.find((c) => c.id === id);
  },

  getByPaymentId(paymentId: string): Consulta | undefined {
    return inMemoryConsultas.find((c) => c.paymentId === paymentId);
  },

  create(data: Omit<Consulta, "id" | "estado_pago" | "estado_consulta">): Consulta {
    const newConsulta: Consulta = {
      ...data,
      id: "cons_" + Math.random().toString(36).substr(2, 9),
      estado_pago: "pending",
      estado_consulta: "pending_payment",
    };

    inMemoryConsultas.push(newConsulta);
    this.saveToDisk();
    return newConsulta;
  },

  update(id: string, updates: Partial<Consulta>): Consulta | undefined {
    const index = inMemoryConsultas.findIndex((c) => c.id === id);
    if (index === -1) return undefined;

    inMemoryConsultas[index] = {
      ...inMemoryConsultas[index],
      ...updates,
    };

    this.saveToDisk();
    return inMemoryConsultas[index];
  },

  updateByPaymentId(paymentId: string, updates: Partial<Consulta>): Consulta | undefined {
    const index = inMemoryConsultas.findIndex((c) => c.paymentId === paymentId);
    if (index === -1) return undefined;

    inMemoryConsultas[index] = {
      ...inMemoryConsultas[index],
      ...updates,
    };

    this.saveToDisk();
    return inMemoryConsultas[index];
  },

  saveToDisk() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(FILE_PATH, JSON.stringify(inMemoryConsultas, null, 2), "utf-8");
    } catch (error) {
      console.error("Error saving database to file:", error);
    }
  },
};
