import { haversineDistanceMeters } from "./geo";
import { localizeEquipmentLabel, localizeStatusLabel } from "./localizePoint";
import type { AccessPoint, Coordinates, LanguageCode } from "../types/healthpoint";

export interface AssistantResponsePayload {
  mode: "ai" | "deterministic";
  provider: string | null;
  reply: string;
  matchedIds: string[];
}

export function runDeterministicAssistant(
  query: string,
  language: LanguageCode,
  points: AccessPoint[],
  origin: Coordinates
): AssistantResponsePayload {
  const q = query.trim().toLowerCase();
  const wantWheelchair = /wheelchair|əlil|pandus|коляс|доступ/.test(q);
  const wantBp = /blood pressure|təzyiq|давлен/.test(q);
  const wantHr = /heart rate|pulse|nəbz|ürək|пульс|сердц/.test(q);
  const wantAed = /aed|defibril|дефибрил/.test(q);
  const wantOximeter = /oximeter|oxygen|oksigen|пульсокси/.test(q);
  const wantFirstAid = /first[- ]?aid|tibbi yardım|аптеч/.test(q);
  const want247 = /24\/7|night|gecə|круглосут/.test(q);
  const wantOperational = /operational|open|available|işlək|açıq|работает|доступн/.test(q);
  const isEmergency =
    /chest pain|unconscious|bleeding|stroke|emergency|sos|103|112|huş|ürəyim|təcili|боль в груди|скорая/.test(
      q
    );

  // Also check if user typed a neighborhood or street name from Baku
  const tokens = q
    .split(/\s+/)
    .map((t) => t.replace(/[^\p{L}\p{N}-]/gu, ""))
    .filter((t) => t.length >= 3);

  let candidates = points.filter((p) => {
    if (wantWheelchair && !p.wheelchairAccessible) return false;
    if (wantBp && !p.equipment.includes("Blood pressure monitor")) return false;
    if (wantHr && !p.equipment.includes("Heart rate monitor")) return false;
    if (wantAed && !p.equipment.includes("AED")) return false;
    if (wantOximeter && !p.equipment.includes("Pulse oximeter")) return false;
    if (wantFirstAid && !p.equipment.includes("First-aid kit")) return false;
    if (want247 && !p.open247) return false;
    if (wantOperational && p.operationalStatus !== "operational") return false;
    return true;
  });

  // Narrow further if user mentioned a specific place token that matches subset
  const specificMatches = candidates.filter((p) => {
    const hay = `${p.name} ${p.address} ${p.neighborhood}`.toLowerCase();
    return tokens.some((tok) => hay.includes(tok));
  });
  if (specificMatches.length > 0 && tokens.length > 0 && !wantWheelchair && !wantBp && !wantAed && !wantHr) {
    candidates = specificMatches;
  }

  if (candidates.length === 0) {
    candidates = points.filter((p) => p.operationalStatus === "operational");
  }

  const ranked = candidates
    .map((p) => ({
      point: p,
      dist: haversineDistanceMeters(origin, { lat: p.latitude, lng: p.longitude }),
    }))
    .sort((a, b) => {
      if (a.point.operationalStatus === "operational" && b.point.operationalStatus !== "operational") {
        return -1;
      }
      if (b.point.operationalStatus === "operational" && a.point.operationalStatus !== "operational") {
        return 1;
      }
      return a.dist - b.dist;
    })
    .slice(0, 3);

  const matchedIds = ranked.map((r) => r.point.id);
  const lines = ranked
    .map((r) => {
      const distLabel = r.dist < 1000 ? `${Math.round(r.dist)} m` : `${(r.dist / 1000).toFixed(2)} km`;
      const statusText = localizeStatusLabel(r.point.operationalStatus, language);
      const eqText = r.point.equipment.map((eq) => localizeEquipmentLabel(eq, language)).join(", ");
      return `• ${r.point.name} (${distLabel}, ${statusText}) — ${eqText}`;
    })
    .join("\n");

  if (language === "az") {
    const emergencyNote = isEmergency
      ? "Diqqət: Təcili tibbi vəziyyət varsa, dərhal 103 (Təcili Yardım) və ya 112 ilə əlaqə saxlayın.\n\n"
      : "";
    return {
      mode: "deterministic",
      provider: null,
      reply:
        `${emergencyNote}Məlumat bazası üzrə deterministik axtarış (AI API açarı konfiqurasiya edilməyib):\n\n` +
        `${lines || "Uyğun məntəqə tapılmadı."}\n\n` +
        "Qeyd: Bu məntəqələr demo infrastrukturu təmsil edir və peşəkar tibbi yardımı əvəz etmir.",
      matchedIds,
    };
  }

  if (language === "ru") {
    const emergencyNote = isEmergency
      ? "Внимание: При острой угрозе здоровью немедленно звоните 103 или 112.\n\n"
      : "";
    return {
      mode: "deterministic",
      provider: null,
      reply:
        `${emergencyNote}Детерминированный поиск по базе (ключ ИИ на сервере не настроен):\n\n` +
        `${lines || "Подходящие точки не найдены."}\n\n` +
        "Примечание: демо-точки не заменяют профессиональную экстренную помощь.",
      matchedIds,
    };
  }

  const emergencyNote = isEmergency
    ? "Urgent notice: If this is a medical emergency, call 103 or 112 immediately.\n\n"
    : "";
  return {
    mode: "deterministic",
    provider: null,
    reply:
      `${emergencyNote}Deterministic database search (no external AI provider key configured):\n\n` +
      `${lines || "No matching access points found."}\n\n` +
      "Note: Demo locations do not replace emergency medical services.",
    matchedIds,
  };
}
