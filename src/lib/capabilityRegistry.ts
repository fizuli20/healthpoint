export type CapabilityStatus =
  | "implemented_software"
  | "simulated_prototype"
  | "physical_prototype_design"
  | "planned_hardware_integration"
  | "planned_partner_integration"
  | "validated_live";

export interface CapabilityItem {
  id: string;
  name: string;
  category: "kiosk" | "mobile" | "operator" | "clinical" | "hardware";
  status: CapabilityStatus;
  badgeAz: string;
  badgeEn: string;
  descriptionAz: string;
  descriptionEn: string;
  technicalDetailsAz: string;
  technicalDetailsEn: string;
}

export const CAPABILITY_REGISTRY: Record<string, CapabilityItem> = {
  kiosk_touch_workflow: {
    id: "kiosk_touch_workflow",
    name: "Köşk Sensor İnterfeysi",
    category: "kiosk",
    status: "implemented_software",
    badgeAz: "İcra Edilmiş Prototip",
    badgeEn: "Implemented Software",
    descriptionAz:
      "1920x1080 və planşet sensor ekranları üçün tam əlçatan, 56-72px toxunma hədəfləri və vəziyyət maşını.",
    descriptionEn:
      "Full accessible state machine for touchscreen kiosks with 56-72px touch targets.",
    technicalDetailsAz: "React 18 + TypeScript typed reducer, zəmanətli anonimlik.",
    technicalDetailsEn: "React 18 + TypeScript typed reducer, ephemeral state.",
  },
  pulse_sqi_algorithm: {
    id: "pulse_sqi_algorithm",
    name: "Deterministik Nəbz SQI Alqoritmi",
    category: "clinical",
    status: "implemented_software",
    badgeAz: "İcra Edilmiş Alqoritm",
    badgeEn: "Implemented Algorithm",
    descriptionAz:
      "Sintetik PPG siqnallarında sistolik zirvələri və hərəkət küyünü aşkar edən SQI qiymətləndirməsi.",
    descriptionEn:
      "Deterministic Signal Quality Index (SQI) evaluating systolic peaks and motion artifacts.",
    technicalDetailsAz:
      "src/lib/sensorSignalAi.ts — Morfologiya, zirvə müntəzəmliyi və tezlik spektri təhlili.",
    technicalDetailsEn:
      "src/lib/sensorSignalAi.ts — Peak regularity and frequency spectrum analysis.",
  },
  kiosk_pulse_measurement: {
    id: "kiosk_pulse_measurement",
    name: "Köşk Nəbz Ölçümü",
    category: "kiosk",
    status: "simulated_prototype",
    badgeAz: "Simulyasiya Edilmiş Nümayiş",
    badgeEn: "Simulated Prototype",
    descriptionAz:
      "Deterministik sintetik PPG dalğası ilə 15 saniyəlik nümayiş nəbz ölçümü. Real tibbi ölçmə deyil.",
    descriptionEn:
      "15-second synthetic PPG demonstration pulse measurement. Not a real clinical measurement.",
    technicalDetailsAz:
      "Həqiqi xəstəxana sensoru deyil; nümayiş üçün deterministik riyazi dalğa və SQI simulyatorudur.",
    technicalDetailsEn: "Deterministic mathematical waveform and SQI simulator for demo purposes.",
  },
  kiosk_emergency_dispatch: {
    id: "kiosk_emergency_dispatch",
    name: "Köşk Təcili Yardım Çağırışı",
    category: "kiosk",
    status: "simulated_prototype",
    badgeAz: "Simulyasiya Edilmiş Çağırış",
    badgeEn: "Simulated Request",
    descriptionAz:
      "Telefon tələb olunmadan birbaşa köşkdən təcili yardım dispetçerinə məkan və köşk kodu ilə simulyasiya bildirişi.",
    descriptionEn:
      "Direct kiosk emergency assistance request simulation with station GPS and ID without a phone.",
    technicalDetailsAz:
      "Lokal simulyasiya adapteri; real 103 xidmətinə sorğu göndərmir. Real zəng üçün 103 nömrəsi göstərilir.",
    technicalDetailsEn:
      "Local simulated adapter. Does not place real emergency calls. 103 hotline provided.",
  },
  nfc_doctor_handoff: {
    id: "nfc_doctor_handoff",
    name: "NFC Həkim Zəngi Handoff-u",
    category: "mobile",
    status: "simulated_prototype",
    badgeAz: "Simulyasiya Edilmiş Handoff",
    badgeEn: "Simulated Handoff",
    descriptionAz:
      "Şəxsi smartfonu köşkün NFC sahəsinə toxunduraraq həkimlə tele-məsləhət seansının başladılması.",
    descriptionEn:
      "Personal smartphone NFC tap handoff initiating a simulated doctor tele-consultation.",
    technicalDetailsAz:
      "Web Audio və animasiyalı səs zəngi interfeysi. Real həkim şəbəkəsi gələcək tərəfdaşlıq üçün planlaşdırılıb.",
    technicalDetailsEn: "Simulated voice UI. Real clinician network planned for pilot phase.",
  },
  city_telemetry_hub: {
    id: "city_telemetry_hub",
    name: "Bələdiyyə Şəbəkə İdarəetməsi (OpenCare City)",
    category: "operator",
    status: "implemented_software",
    badgeAz: "İcra Edilmiş İdarəetmə",
    badgeEn: "Implemented Operator Hub",
    descriptionAz:
      "Bakının 15 məntəqəlik şəbəkəsində köşk sessiyaları, siqnal təkrar faizi və texniki xidmət qeydlərinin real-vaxt izlənməsi.",
    descriptionEn:
      "Real-time monitoring of 15 Baku stations, session telemetry, retry rates, and maintenance triage.",
    technicalDetailsAz:
      "BroadcastChannel və localStorage əsaslı hadisə şini ilə real-vaxt sinxronizasiyası.",
    technicalDetailsEn: "Real-time sync via BroadcastChannel and localStorage demo event bus.",
  },
  ble_hardware_dock: {
    id: "ble_hardware_dock",
    name: "Aparat BLE Tibbi Sensor Qovşağı",
    category: "hardware",
    status: "planned_hardware_integration",
    badgeAz: "Planlaşdırılan Aparat İnteqrasiyası",
    badgeEn: "Planned Hardware Integration",
    descriptionAz:
      "Köşkün fiziki yuvasında saxlanılan və Bluetooth Low Energy ilə köşkə qoşulan tibbi sertifikatlı sensor.",
    descriptionEn:
      "Medical-grade pulse sensor stored in kiosk dock and paired via Bluetooth Low Energy.",
    technicalDetailsAz:
      "Prototip mərhələsində simulyasiya olunur. Pilot mərhələsində BLE GATT protokolu tətbiq olunacaq.",
    technicalDetailsEn: "Simulated in prototype. BLE GATT protocol planned for physical pilot.",
  },
  certified_103_integration: {
    id: "certified_103_integration",
    name: "103 / TƏBİB Rəsmi Dispetçer İnteqrasiyası",
    category: "clinical",
    status: "planned_partner_integration",
    badgeAz: "Planlaşdırılan Tərəfdaşlıq",
    badgeEn: "Planned Partner Integration",
    descriptionAz:
      "Təcili Tibbi Yardım Mərkəzi ilə birbaşa telemetriya və geolokasiya API inteqrasiyası.",
    descriptionEn:
      "Direct telemetry and geolocation API integration with Baku 103 Emergency Medical Services.",
    technicalDetailsAz:
      "B2G pilot razılaşması tələb edir. Hakaton versiyasında təhlükəsiz yerli simulyatordan istifadə olunur.",
    technicalDetailsEn:
      "Requires B2G regulatory partnership. Safe local simulator used for hackathon.",
  },
};

export function getCapability(id: string): CapabilityItem | undefined {
  return CAPABILITY_REGISTRY[id];
}

export function getCapabilitiesByCategory(
  category: CapabilityItem["category"]
): CapabilityItem[] {
  return Object.values(CAPABILITY_REGISTRY).filter((c) => c.category === category);
}

export function getStatusBadgeClass(status: CapabilityStatus): string {
  switch (status) {
    case "implemented_software":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "simulated_prototype":
      return "bg-amber-50 text-amber-800 border-amber-200";
    case "physical_prototype_design":
      return "bg-blue-50 text-blue-800 border-blue-200";
    case "planned_hardware_integration":
      return "bg-indigo-50 text-indigo-800 border-indigo-200";
    case "planned_partner_integration":
      return "bg-purple-50 text-purple-800 border-purple-200";
    case "validated_live":
      return "bg-green-50 text-green-900 border-green-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
}
