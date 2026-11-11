import type { AccessPoint } from "../src/types/healthpoint";

declare const process: { env: Record<string, string | undefined> };

interface AssistantRequestBody {
  query?: string;
  language?: string;
  userLocation?: { lat: number; lng: number } | null;
  points?: AccessPoint[];
}

const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 25;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const entry = rateBuckets.get(clientKey);
  if (!entry || now >= entry.resetAt) {
    rateBuckets.set(clientKey, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_MAX_REQUESTS) {
    return false;
  }
  entry.count += 1;
  return true;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function buildDeterministicReply(
  query: string,
  language: string,
  points: AccessPoint[],
  userLocation: { lat: number; lng: number } | null
): { reply: string; matchedIds: string[] } {
  const q = query.toLowerCase();
  const wantWheelchair = /wheelchair|əlil|pandus|коляс|доступ/.test(q);
  const wantBp = /blood pressure|təzyiq|давлен/.test(q);
  const wantHr = /heart rate|pulse|nəbz|ürək|пульс|сердц/.test(q);
  const wantAed = /aed|defibril|дефибрил/.test(q);
  const wantOximeter = /oximeter|oxygen|oksigen|пульсокси/.test(q);
  const wantOperational = /operational|open|available|işlək|açıq|работает|доступн/.test(q);
  const isEmergency = /chest pain|unconscious|bleeding|stroke|emergency|sos|103|112|huş|ürəyim|təcili|боль в груди|скорая/.test(q);

  const origin = userLocation ?? { lat: 40.3715, lng: 49.8415 };

  let candidates = points.filter((p) => {
    if (wantWheelchair && !p.wheelchairAccessible) return false;
    if (wantBp && !p.equipment.includes("Blood pressure monitor")) return false;
    if (wantHr && !p.equipment.includes("Heart rate monitor")) return false;
    if (wantAed && !p.equipment.includes("AED")) return false;
    if (wantOximeter && !p.equipment.includes("Pulse oximeter")) return false;
    if (wantOperational && p.operationalStatus !== "operational") return false;
    return true;
  });

  if (candidates.length === 0) {
    candidates = points.filter((p) => p.operationalStatus === "operational");
  }

  const ranked = candidates
    .map((p) => ({
      point: p,
      dist: haversineMeters(origin.lat, origin.lng, p.latitude, p.longitude),
    }))
    .sort((a, b) => {
      if (a.point.operationalStatus === "operational" && b.point.operationalStatus !== "operational") return -1;
      if (b.point.operationalStatus === "operational" && a.point.operationalStatus !== "operational") return 1;
      return a.dist - b.dist;
    })
    .slice(0, 3);

const STATUS_LABELS: Record<string, Record<string, string>> = {
  az: {
    operational: "İşləkdir",
    limited: "Məhdud Xidmət",
    unavailable: "Əlçatmazdır",
    unknown: "Naməlum",
  },
  ru: {
    operational: "Работает",
    limited: "Ограниченный сервис",
    unavailable: "Недоступно",
    unknown: "Неизвестно",
  },
};

const EQUIPMENT_LABELS: Record<string, Record<string, string>> = {
  az: {
    "Blood pressure monitor": "Qan təzyiqi cihazı",
    "Heart rate monitor": "Nəbz ölçən",
    "Pulse oximeter": "Pulsoksimetr",
    "First-aid kit": "İlk yardım çantası",
    "SOS communication button": "SOS çağrı düyməsi",
    AED: "AED (Defibrilyator)",
  },
  ru: {
    "Blood pressure monitor": "Тонометр",
    "Heart rate monitor": "Пульсометр",
    "Pulse oximeter": "Пульсоксиметр",
    "First-aid kit": "Аптечка",
    "SOS communication button": "Кнопка вызова SOS",
    AED: "Дефибриллятор AED",
  },
};

  const matchedIds = ranked.map((r) => r.point.id);
  const lines = ranked
    .map((r) => {
      const distLabel = r.dist < 1000 ? `${Math.round(r.dist)} m` : `${(r.dist / 1000).toFixed(2)} km`;
      const statusText = STATUS_LABELS[language]?.[r.point.operationalStatus] ?? r.point.operationalStatus;
      const eqText = r.point.equipment
        .map((eq) => EQUIPMENT_LABELS[language]?.[eq] ?? eq)
        .join(", ");
      return `• ${r.point.name} (${distLabel}, ${statusText}) — ${eqText}`;
    })
    .join("\n");

  if (language === "az") {
    const emergencyNote = isEmergency
      ? "Diqqət: Təcili tibbi vəziyyət varsa, dərhal 103 (Təcili Yardım) və ya 112 ilə əlaqə saxlayın.\n\n"
      : "";
    return {
      reply:
        `${emergencyNote}Məlumat bazası üzrə deterministik axtarış (AI API açarı serverdə konfiqurasiya edilməyib):\n\n` +
        `${lines || "Uyğun məntəqə tapılmadı."}\n\n` +
        `Qeyd: Bu məntəqələr demo infrastrukturu təmsil edir və peşəkar tibbi yardımı əvəz etmir.`,
      matchedIds,
    };
  }

  if (language === "ru") {
    const emergencyNote = isEmergency
      ? "Внимание: При острой угрозе здоровью немедленно звоните 103 или 112.\n\n"
      : "";
    return {
      reply:
        `${emergencyNote}Детерминированный поиск по базе (ключ ИИ на сервере не настроен):\n\n` +
        `${lines || "Подходящие точки не найдены."}\n\n` +
        `Примечание: демо-точки не заменяют профессиональную экстренную помощь.`,
      matchedIds,
    };
  }

  const emergencyNote = isEmergency
    ? "Urgent notice: If this is a medical emergency, call 103 or 112 immediately.\n\n"
    : "";
  return {
    reply:
      `${emergencyNote}Deterministic database search (no external AI provider key configured on server):\n\n` +
      `${lines || "No matching access points found."}\n\n` +
      `Note: Demo locations do not replace emergency medical services.`,
    matchedIds,
  };
}

interface ProviderConfig {
  providerName: string;
  endpoint: string;
  apiKey: string;
  model: string;
  kind: "openai_compatible" | "gemini";
}

function getConfiguredProvider(): ProviderConfig | null {
  if (process.env.OPENROUTER_API_KEY) {
    return {
      providerName: "OpenRouter",
      endpoint: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      kind: "openai_compatible",
    };
  }
  if (process.env.NVIDIA_API_KEY) {
    return {
      providerName: "NVIDIA NIM",
      endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
      apiKey: process.env.NVIDIA_API_KEY,
      model: process.env.NVIDIA_MODEL || "meta/llama-3.1-70b-instruct",
      kind: "openai_compatible",
    };
  }
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (grokKey) {
    return {
      providerName: "xAI Grok",
      endpoint: "https://api.x.ai/v1/chat/completions",
      apiKey: grokKey,
      model: process.env.XAI_MODEL || "grok-2-latest",
      kind: "openai_compatible",
    };
  }
  if (process.env.OPENAI_API_KEY) {
    return {
      providerName: "OpenAI",
      endpoint: "https://api.openai.com/v1/chat/completions",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      kind: "openai_compatible",
    };
  }
  if (process.env.GEMINI_API_KEY) {
    return {
      providerName: "Google Gemini",
      endpoint: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      kind: "gemini",
    };
  }
  return null;
}

const ALLOWED_ORIGINS = new Set([
  "https://healthpoint-tawny.vercel.app",
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:5173",
]);

export default async function handler(req: any, res: any) {
  const requestOrigin = req.headers?.origin as string | undefined;
  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const forwarded = (req.headers?.["x-forwarded-for"] as string | undefined) || "unknown";
  const clientIp = forwarded.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ error: "Too many requests. Please wait a minute." });
    return;
  }

  let body: AssistantRequestBody = {};
  try {
    body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  const query = typeof body.query === "string" ? body.query.trim().slice(0, 800) : "";
  const language = body.language === "en" || body.language === "ru" ? body.language : "az";
  const points = Array.isArray(body.points) ? body.points.slice(0, 50) : [];
  const userLocation =
    body.userLocation &&
    typeof body.userLocation.lat === "number" &&
    typeof body.userLocation.lng === "number"
      ? body.userLocation
      : null;

  if (!query) {
    res.status(400).json({ error: "Query is required." });
    return;
  }

  const deterministic = buildDeterministicReply(query, language, points, userLocation);
  const provider = getConfiguredProvider();

  if (!provider) {
    res.status(200).json({
      mode: "deterministic",
      provider: null,
      reply: deterministic.reply,
      matchedIds: deterministic.matchedIds,
    });
    return;
  }

  const origin = userLocation ?? { lat: 40.3715, lng: 49.8415 };
  const catalogContext = points
    .map((p) => {
      const distMeters = Math.round(haversineMeters(origin.lat, origin.lng, p.latitude, p.longitude));
      return {
        id: p.id,
        name: p.name,
        address: p.address,
        status: p.operationalStatus,
        distanceMeters: distMeters,
        wheelchairAccessible: p.wheelchairAccessible,
        audioGuided: p.audioGuided,
        open247: p.open247,
        equipment: p.equipment,
        isDemo: p.isDemo,
      };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  const systemPrompt =
    `You are OpenCarePoint Assistant. Reply strictly in ${language === "az" ? "Azerbaijani" : language === "ru" ? "Russian" : "English"}. ` +
    `ONLY recommend locations present in the provided JSON database records. NEVER invent facilities, phone numbers, or diagnoses. ` +
    `Never tell users to delay emergency care; if emergency symptoms appear, direct immediately to Ambulance 103 or Emergency 112. ` +
    `Always remind briefly that Demo locations are not verified medical facilities. Database records:\n${JSON.stringify(catalogContext)}`;

  try {
    if (provider.kind === "gemini") {
      const resp = await fetch(provider.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${query}` }] }],
        }),
      });
      if (!resp.ok) throw new Error(`Provider error ${resp.status}`);
      const json = await resp.json();
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("Empty Gemini response");
      res.status(200).json({
        mode: "ai",
        provider: provider.providerName,
        reply: text,
        matchedIds: deterministic.matchedIds,
      });
      return;
    }

    const resp = await fetch(provider.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        temperature: 0.2,
        max_tokens: 450,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: query },
        ],
      }),
    });
    if (!resp.ok) throw new Error(`Provider error ${resp.status}`);
    const json = await resp.json();
    const text = json?.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty LLM response");
    res.status(200).json({
      mode: "ai",
      provider: provider.providerName,
      reply: text,
      matchedIds: deterministic.matchedIds,
    });
  } catch {
    res.status(200).json({
      mode: "deterministic",
      provider: null,
      reply: deterministic.reply,
      matchedIds: deterministic.matchedIds,
    });
  }
}
