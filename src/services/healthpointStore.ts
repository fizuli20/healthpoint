import { DEMO_ACCESS_POINTS, DEMO_REPORTS } from "../data/bakuDemoPoints";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import type {
  AccessPoint,
  AccessibilityPreferences,
  EmergencyContact,
  EquipmentItem,
  IssueType,
  LanguageCode,
  MaintenanceReport,
  MedicalCardInfo,
  OperationalStatus,
  PartnerInquiry,
  ReportStatus,
  UserProfile,
  VitalReadingRecord,
} from "../types/healthpoint";

const KEYS = {
  POINTS: "hp_demo_points_v1",
  REPORTS: "hp_demo_reports_v1",
  SAVED: "hp_saved_points_v1",
  CONTACTS: "hp_emergency_contacts_v1",
  PROFILE: "hp_profile_v1",
  ACCESSIBILITY: "hp_accessibility_v1",
  LANGUAGE: "hp_language_v1",
  DEMO_AUTH: "hp_demo_auth_v1",
  VITALS: "hp_vital_readings_v1",
  PARTNER_INQUIRIES: "hp_partner_inquiries_v1",
  MEDICAL_CARD: "hp_medical_card_v1",
  SEED_VERSION: "hp_seed_version_v1",
};

const CURRENT_SEED_VERSION = "15_v1";

export const DEFAULT_ACCESSIBILITY: AccessibilityPreferences = {
  easyAccessMode: false,
  fontSize: "normal",
  highContrast: false,
  reducedMotion: false,
  simpleLanguage: false,
};

function safeReadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

function mapPointRow(row: Record<string, unknown>): AccessPoint {
  return {
    id: String(row.id),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    neighborhood: String(row.neighborhood ?? ""),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    address: String(row.address ?? ""),
    operationalStatus: (row.operational_status as OperationalStatus) ?? "unknown",
    equipment: Array.isArray(row.equipment) ? (row.equipment as EquipmentItem[]) : [],
    wheelchairAccessible: Boolean(row.wheelchair_accessible),
    audioGuided: Boolean(row.audio_guided),
    open247: Boolean(row.open_24_7),
    openingHours: String(row.opening_hours ?? "24/7"),
    lastVerifiedAt: String(row.last_verified_at ?? new Date().toISOString()),
    imageUrl: (row.image_url as string | null) ?? null,
    isDemo: Boolean(row.is_demo ?? true),
    usageCount: Number(row.usage_count ?? 0),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  };
}

function toPointDbRow(point: Partial<AccessPoint>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (point.name !== undefined) row.name = point.name;
  if (point.description !== undefined) row.description = point.description;
  if (point.neighborhood !== undefined) row.neighborhood = point.neighborhood;
  if (point.latitude !== undefined) row.latitude = point.latitude;
  if (point.longitude !== undefined) row.longitude = point.longitude;
  if (point.address !== undefined) row.address = point.address;
  if (point.operationalStatus !== undefined) row.operational_status = point.operationalStatus;
  if (point.equipment !== undefined) row.equipment = point.equipment;
  if (point.wheelchairAccessible !== undefined) row.wheelchair_accessible = point.wheelchairAccessible;
  if (point.audioGuided !== undefined) row.audio_guided = point.audioGuided;
  if (point.open247 !== undefined) row.open_24_7 = point.open247;
  if (point.openingHours !== undefined) row.opening_hours = point.openingHours;
  if (point.lastVerifiedAt !== undefined) row.last_verified_at = point.lastVerifiedAt;
  if (point.imageUrl !== undefined) row.image_url = point.imageUrl;
  if (point.isDemo !== undefined) row.is_demo = point.isDemo;
  if (point.usageCount !== undefined) row.usage_count = point.usageCount;
  return row;
}

export function getDemoPoints(): AccessPoint[] {
  const stored = safeReadJson<AccessPoint[] | null>(KEYS.POINTS, null);
  const seedVersion = window.localStorage.getItem(KEYS.SEED_VERSION);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    if (seedVersion === CURRENT_SEED_VERSION) {
      return stored;
    }
    const seedById = new Map(DEMO_ACCESS_POINTS.map((p) => [p.id, p]));
    const existingIds = new Set(stored.map((p) => p.id));
    const upgraded = stored.map((pt) => {
      const seed = seedById.get(pt.id);
      if (!seed) return pt;
      return {
        ...pt,
        placementZone: pt.placementZone ?? seed.placementZone,
        placementReason: pt.placementReason ?? seed.placementReason,
      };
    });
    for (const seed of DEMO_ACCESS_POINTS) {
      if (!existingIds.has(seed.id)) {
        upgraded.push(seed);
      }
    }
    safeWriteJson(KEYS.POINTS, upgraded);
    try {
      window.localStorage.setItem(KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
    } catch {
      // ignore storage errors
    }
    return upgraded;
  }
  safeWriteJson(KEYS.POINTS, DEMO_ACCESS_POINTS);
  try {
    window.localStorage.setItem(KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
  } catch {
    // ignore storage errors
  }
  return DEMO_ACCESS_POINTS;
}

export function getDemoReports(): MaintenanceReport[] {
  const stored = safeReadJson<MaintenanceReport[] | null>(KEYS.REPORTS, null);
  if (stored && Array.isArray(stored)) {
    const existingIds = new Set(stored.map((r) => r.id));
    let changed = false;
    const merged = [...stored];
    for (const rep of DEMO_REPORTS) {
      if (!existingIds.has(rep.id)) {
        merged.push(rep);
        changed = true;
      }
    }
    if (changed) safeWriteJson(KEYS.REPORTS, merged);
    return merged;
  }
  safeWriteJson(KEYS.REPORTS, DEMO_REPORTS);
  return DEMO_REPORTS;
}

export async function fetchAccessPoints(): Promise<AccessPoint[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("access_points")
      .select("*")
      .order("created_at", { ascending: true });
    if (!error && data) {
      return data.map((row) => mapPointRow(row as Record<string, unknown>));
    }
  }
  return getDemoPoints();
}

export async function fetchAccessPointById(id: string): Promise<AccessPoint | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("access_points")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!error && data) {
      return mapPointRow(data as Record<string, unknown>);
    }
  }
  return getDemoPoints().find((p) => p.id === id) ?? null;
}

export async function createAccessPoint(
  input: Omit<AccessPoint, "id" | "createdAt" | "updatedAt" | "usageCount">
): Promise<AccessPoint> {
  const now = new Date().toISOString();
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("access_points")
      .insert(toPointDbRow({ ...input, usageCount: 0 }))
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPointRow(data as Record<string, unknown>);
  }

  const next: AccessPoint = {
    ...input,
    id: `hp-${Date.now().toString(36)}`,
    usageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const all = [...getDemoPoints(), next];
  safeWriteJson(KEYS.POINTS, all);
  return next;
}

export async function updateAccessPoint(
  id: string,
  patch: Partial<AccessPoint>
): Promise<AccessPoint> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("access_points")
      .update(toPointDbRow({ ...patch, lastVerifiedAt: new Date().toISOString() }))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return mapPointRow(data as Record<string, unknown>);
  }

  const all = getDemoPoints();
  const idx = all.findIndex((p) => p.id === id);
  if (idx < 0) throw new Error("Access point not found");
  const updated: AccessPoint = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...all];
  copy[idx] = updated;
  safeWriteJson(KEYS.POINTS, copy);
  return updated;
}

export async function deleteAccessPoint(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.from("access_points").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }
  const filtered = getDemoPoints().filter((p) => p.id !== id);
  safeWriteJson(KEYS.POINTS, filtered);
}

export async function trackAccessPointView(id: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    // Non-blocking best effort usage count bump via RPC or skipped if restricted
    return;
  }
  const all = getDemoPoints();
  const idx = all.findIndex((p) => p.id === id);
  if (idx >= 0) {
    const copy = [...all];
    copy[idx] = { ...copy[idx], usageCount: copy[idx].usageCount + 1 };
    safeWriteJson(KEYS.POINTS, copy);
  }
}

export async function fetchMaintenanceReports(): Promise<MaintenanceReport[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("maintenance_reports")
      .select("*, access_points(name)")
      .order("created_at", { ascending: false });
    if (!error && data) {
      return data.map((r: Record<string, unknown>) => ({
        id: String(r.id),
        accessPointId: String(r.access_point_id),
        accessPointName: (r.access_points as { name?: string } | null)?.name,
        userId: (r.user_id as string | null) ?? null,
        issueType: r.issue_type as IssueType,
        description: String(r.description),
        status: r.status as ReportStatus,
        createdAt: String(r.created_at),
        updatedAt: String(r.updated_at),
      }));
    }
  }
  const points = getDemoPoints();
  const nameMap = new Map(points.map((p) => [p.id, p.name]));
  return getDemoReports().map((rep) => ({
    ...rep,
    accessPointName: nameMap.get(rep.accessPointId) ?? rep.accessPointName ?? rep.accessPointId,
  }));
}

export async function submitMaintenanceReport(input: {
  accessPointId: string;
  issueType: IssueType;
  description: string;
  userId?: string | null;
}): Promise<MaintenanceReport> {
  const desc = input.description.trim();
  if (desc.length < 5) {
    throw new Error("Description must be at least 5 characters.");
  }

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("maintenance_reports")
      .insert({
        access_point_id: input.accessPointId,
        user_id: input.userId ?? null,
        issue_type: input.issueType,
        description: desc,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: String(data.id),
      accessPointId: String(data.access_point_id),
      userId: data.user_id,
      issueType: data.issue_type,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const now = new Date().toISOString();
  const point = getDemoPoints().find((p) => p.id === input.accessPointId);
  const created: MaintenanceReport = {
    id: `rep-${Date.now().toString(36)}`,
    accessPointId: input.accessPointId,
    accessPointName: point?.name ?? input.accessPointId,
    userId: input.userId ?? null,
    issueType: input.issueType,
    description: desc,
    status: "open",
    assignedTo: "",
    notes: "",
    createdAt: now,
    updatedAt: now,
  };
  const all = [created, ...getDemoReports()];
  safeWriteJson(KEYS.REPORTS, all);
  return created;
}

export async function updateMaintenanceReport(
  id: string,
  patch: { status?: ReportStatus; assignedTo?: string; notes?: string }
): Promise<MaintenanceReport> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from("maintenance_reports")
      .update({ status: patch.status })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: String(data.id),
      accessPointId: String(data.access_point_id),
      userId: data.user_id,
      issueType: data.issue_type,
      description: data.description,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  const all = getDemoReports();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) throw new Error("Report not found");
  const updated: MaintenanceReport = {
    ...all[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const copy = [...all];
  copy[idx] = updated;
  safeWriteJson(KEYS.REPORTS, copy);
  return updated;
}

export async function fetchSavedPointIds(userId?: string | null): Promise<string[]> {
  if (isSupabaseConfigured() && supabase && userId) {
    const { data, error } = await supabase
      .from("saved_points")
      .select("access_point_id")
      .eq("user_id", userId);
    if (!error && data) {
      return data.map((row) => String(row.access_point_id));
    }
  }
  return safeReadJson<string[]>(KEYS.SAVED, []);
}

export async function toggleSavedPointId(
  accessPointId: string,
  userId?: string | null
): Promise<string[]> {
  if (isSupabaseConfigured() && supabase && userId) {
    const existing = await fetchSavedPointIds(userId);
    if (existing.includes(accessPointId)) {
      await supabase
        .from("saved_points")
        .delete()
        .eq("user_id", userId)
        .eq("access_point_id", accessPointId);
      return existing.filter((id) => id !== accessPointId);
    }
    await supabase
      .from("saved_points")
      .insert({ user_id: userId, access_point_id: accessPointId });
    return [...existing, accessPointId];
  }

  const current = safeReadJson<string[]>(KEYS.SAVED, []);
  const next = current.includes(accessPointId)
    ? current.filter((id) => id !== accessPointId)
    : [...current, accessPointId];
  safeWriteJson(KEYS.SAVED, next);
  return next;
}

export async function fetchEmergencyContacts(userId?: string | null): Promise<EmergencyContact[]> {
  if (isSupabaseConfigured() && supabase && userId) {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (!error && data) {
      return data.map((c) => ({
        id: String(c.id),
        contactName: String(c.contact_name),
        phoneNumber: String(c.phone_number),
      }));
    }
  }
  return safeReadJson<EmergencyContact[]>(KEYS.CONTACTS, []);
}

export async function addEmergencyContact(
  contact: { contactName: string; phoneNumber: string },
  userId?: string | null
): Promise<EmergencyContact> {
  const contactName = contact.contactName.trim();
  const phoneNumber = contact.phoneNumber.trim();
  if (!contactName || phoneNumber.length < 5) {
    throw new Error("Valid contact name and phone number are required.");
  }

  if (isSupabaseConfigured() && supabase && userId) {
    const { data, error } = await supabase
      .from("emergency_contacts")
      .insert({ user_id: userId, contact_name: contactName, phone_number: phoneNumber })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return {
      id: String(data.id),
      contactName: String(data.contact_name),
      phoneNumber: String(data.phone_number),
    };
  }

  const created: EmergencyContact = {
    id: `ec-${Date.now().toString(36)}`,
    contactName,
    phoneNumber,
  };
  const all = [...safeReadJson<EmergencyContact[]>(KEYS.CONTACTS, []), created];
  safeWriteJson(KEYS.CONTACTS, all);
  return created;
}

export async function deleteEmergencyContact(id: string, userId?: string | null): Promise<void> {
  if (isSupabaseConfigured() && supabase && userId) {
    await supabase.from("emergency_contacts").delete().eq("id", id).eq("user_id", userId);
    return;
  }
  const all = safeReadJson<EmergencyContact[]>(KEYS.CONTACTS, []).filter((c) => c.id !== id);
  safeWriteJson(KEYS.CONTACTS, all);
}

export function loadStoredAccessibility(): AccessibilityPreferences {
  return {
    ...DEFAULT_ACCESSIBILITY,
    ...safeReadJson<Partial<AccessibilityPreferences>>(KEYS.ACCESSIBILITY, {}),
  };
}

export function saveStoredAccessibility(prefs: AccessibilityPreferences): void {
  safeWriteJson(KEYS.ACCESSIBILITY, prefs);
}

export function loadStoredLanguage(): LanguageCode {
  const val = window.localStorage.getItem(KEYS.LANGUAGE);
  if (val === "az" || val === "en" || val === "ru") return val;
  return "az";
}

export function saveStoredLanguage(lang: LanguageCode): void {
  try {
    window.localStorage.setItem(KEYS.LANGUAGE, lang);
  } catch {
    // Ignore storage error
  }
}

export function loadLocalUserProfile(): UserProfile | null {
  const demoAuth = safeReadJson<{ loggedIn: boolean; isAdmin: boolean; email: string; fullName: string } | null>(
    KEYS.DEMO_AUTH,
    null
  );
  const storedPrefs = safeReadJson<Partial<UserProfile>>(KEYS.PROFILE, {});
  if (!demoAuth?.loggedIn) return null;
  return {
    id: demoAuth.isAdmin ? "demo-admin" : "demo-user",
    email: demoAuth.email,
    fullName: storedPrefs.fullName ?? demoAuth.fullName,
    preferredLanguage: loadStoredLanguage(),
    accessibilityPreferences: loadStoredAccessibility(),
    notificationsEnabled: storedPrefs.notificationsEnabled ?? true,
    shareLocationHistory: storedPrefs.shareLocationHistory ?? false,
    isAdmin: demoAuth.isAdmin,
    isDemoAuth: true,
  };
}

export function saveLocalProfilePatch(patch: Partial<UserProfile>): void {
  const current = safeReadJson<Partial<UserProfile>>(KEYS.PROFILE, {});
  safeWriteJson(KEYS.PROFILE, { ...current, ...patch });
  if (patch.preferredLanguage) saveStoredLanguage(patch.preferredLanguage);
  if (patch.accessibilityPreferences) saveStoredAccessibility(patch.accessibilityPreferences);
}

export function setDemoAuthSession(session: {
  loggedIn: boolean;
  isAdmin: boolean;
  email: string;
  fullName: string;
} | null): void {
  if (!session) {
    window.localStorage.removeItem(KEYS.DEMO_AUTH);
    return;
  }
  safeWriteJson(KEYS.DEMO_AUTH, session);
}

export function resetDemoData(): void {
  safeWriteJson(KEYS.POINTS, DEMO_ACCESS_POINTS);
  safeWriteJson(KEYS.REPORTS, DEMO_REPORTS);
  try {
    window.localStorage.setItem(KEYS.SEED_VERSION, CURRENT_SEED_VERSION);
  } catch {
    // ignore storage errors
  }
}

export async function recordStationActivation(pointId: string): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    const { data: current } = await supabase
      .from("access_points")
      .select("usage_count")
      .eq("id", pointId)
      .maybeSingle();
    const nextCount = Number(current?.usage_count ?? 0) + 1;
    await supabase
      .from("access_points")
      .update({ usage_count: nextCount })
      .eq("id", pointId);
    return;
  }

  const all = getDemoPoints();
  const idx = all.findIndex((p) => p.id === pointId);
  if (idx >= 0) {
    const copy = [...all];
    copy[idx] = {
      ...copy[idx],
      usageCount: (copy[idx].usageCount || 0) + 1,
      updatedAt: new Date().toISOString(),
    };
    safeWriteJson(KEYS.POINTS, copy);
  }
}

export async function fetchVitalReadings(): Promise<VitalReadingRecord[]> {
  return safeReadJson<VitalReadingRecord[]>(KEYS.VITALS, []);
}

export async function saveVitalReading(record: VitalReadingRecord): Promise<VitalReadingRecord[]> {
  const current = safeReadJson<VitalReadingRecord[]>(KEYS.VITALS, []);
  const next = [record, ...current].slice(0, 30);
  safeWriteJson(KEYS.VITALS, next);
  return next;
}

export async function clearVitalReadings(): Promise<void> {
  safeWriteJson(KEYS.VITALS, []);
}

export async function fetchPartnerInquiries(): Promise<PartnerInquiry[]> {
  return safeReadJson<PartnerInquiry[]>(KEYS.PARTNER_INQUIRIES, []);
}

export async function submitPartnerInquiry(
  input: Omit<PartnerInquiry, "id" | "createdAt">
): Promise<PartnerInquiry> {
  const created: PartnerInquiry = {
    ...input,
    id: `pi-${Date.now().toString(36)}`,
    createdAt: new Date().toISOString(),
  };
  const current = safeReadJson<PartnerInquiry[]>(KEYS.PARTNER_INQUIRIES, []);
  safeWriteJson(KEYS.PARTNER_INQUIRIES, [created, ...current]);
  return created;
}

const DEFAULT_MEDICAL_CARD: MedicalCardInfo = {
  bloodType: "",
  allergies: "",
  conditions: "",
  medications: "",
};

export function loadMedicalCard(): MedicalCardInfo {
  return {
    ...DEFAULT_MEDICAL_CARD,
    ...safeReadJson<Partial<MedicalCardInfo>>(KEYS.MEDICAL_CARD, {}),
  };
}

export function saveMedicalCard(card: MedicalCardInfo): void {
  safeWriteJson(KEYS.MEDICAL_CARD, card);
}
