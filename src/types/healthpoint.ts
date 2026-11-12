export type OperationalStatus = "operational" | "limited" | "unavailable" | "unknown";

export type EquipmentItem =
  | "Blood pressure monitor"
  | "Heart rate monitor"
  | "Pulse oximeter"
  | "First-aid kit"
  | "SOS communication button"
  | "AED";

export const ALL_EQUIPMENT: EquipmentItem[] = [
  "Blood pressure monitor",
  "Heart rate monitor",
  "Pulse oximeter",
  "First-aid kit",
  "SOS communication button",
  "AED",
];

export type IssueType =
  | "broken_equipment"
  | "incorrect_location"
  | "accessibility_issue"
  | "closed_unavailable"
  | "damaged_infrastructure"
  | "other";

export type ReportStatus = "open" | "in_progress" | "resolved" | "dismissed";

export type LanguageCode = "az" | "en" | "ru";

export type SortMode = "distance" | "availability" | "equipment";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AccessPoint {
  id: string;
  name: string;
  description: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  address: string;
  operationalStatus: OperationalStatus;
  equipment: EquipmentItem[];
  wheelchairAccessible: boolean;
  audioGuided: boolean;
  open247: boolean;
  openingHours: string;
  lastVerifiedAt: string;
  imageUrl?: string | null;
  isDemo: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessibilityPreferences {
  easyAccessMode: boolean;
  fontSize: "normal" | "large" | "xlarge";
  highContrast: boolean;
  reducedMotion: boolean;
  simpleLanguage: boolean;
}

export interface EmergencyContact {
  id: string;
  contactName: string;
  phoneNumber: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  fullName: string;
  preferredLanguage: LanguageCode;
  accessibilityPreferences: AccessibilityPreferences;
  notificationsEnabled: boolean;
  shareLocationHistory: boolean;
  isAdmin: boolean;
  isDemoAuth: boolean;
}

export interface MaintenanceReport {
  id: string;
  accessPointId: string;
  accessPointName?: string;
  userId?: string | null;
  issueType: IssueType;
  description: string;
  status: ReportStatus;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccessPointFilter {
  search: string;
  nearestOnly: boolean;
  operationalOnly: boolean;
  open247Only: boolean;
  wheelchairOnly: boolean;
  equipment: EquipmentItem[];
}

export interface RouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  mode: "walking" | "driving";
  isEstimatedFallback: boolean;
}

export interface AssistantMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  mode?: "ai" | "deterministic";
  provider?: string | null;
  matchedIds?: string[];
  createdAt: string;
}

export type SessionPassType = "free_basic" | "one_time_full" | "tele_consult";

export type SignalQualityStatus = "good" | "poor";

export interface VitalReadingRecord {
  id: string;
  accessPointId: string;
  accessPointName: string;
  kioskCode: string;
  passType: SessionPassType;
  priceAzn: number;
  heartRateBpm: number | null;
  spo2Percent: number | null;
  bloodPressure: string | null;
  signalQualityScore: number;
  signalStatus: SignalQualityStatus;
  snrDb: number;
  aiRecommendationKey: "signalOk" | "signalPoorRetry" | "elevatedFollowUp";
  waveform: number[];
  isDemo: boolean;
  createdAt: string;
}

export interface PartnerInquiry {
  id: string;
  organizationName: string;
  sector: "b2g_municipality" | "b2b_mall_metro" | "clinic_partner";
  contactEmail: string;
  kioskCount: number;
  notes: string;
  createdAt: string;
}

export interface MedicalCardInfo {
  bloodType: string;
  allergies: string;
  conditions: string;
  medications: string;
}
