import type {
  AccessPoint,
  EquipmentItem,
  LanguageCode,
  OperationalStatus,
} from "../types/healthpoint";

const KIOSK_CODES: Record<string, string> = {
  "hp-baku-boulevard": "HP-01",
  "hp-fountain-square": "HP-02",
  "hp-icherisheher": "HP-03",
  "hp-28-may": "HP-04",
  "hp-ganjlik-mall": "HP-05",
  "hp-heydar-aliyev-center": "HP-06",
  "hp-nizami-street": "HP-07",
  "hp-sahil-metro": "HP-08",
};

interface LocalizedFields {
  name: string;
  neighborhood: string;
  address: string;
  description: string;
}

const POINT_TRANSLATIONS: Record<string, Partial<Record<LanguageCode, LocalizedFields>>> = {
  "hp-baku-boulevard": {
    az: {
      name: "HealthPoint — Dənizkənarı Bulvar",
      neighborhood: "Səbail / Bulvar",
      address: "Neftçilər pr. 73, Bakı Bulvarı",
      description:
        "Bakı Bulvarı boyunca əlil arabası səviyyəsində sensor paneli, səsli təlimat və ictimai SOS çağrı düyməsi olan ağıllı sağlamlıq məntəqəsi.",
    },
    ru: {
      name: "HealthPoint — Приморский бульвар",
      neighborhood: "Сабаил / Бульвар",
      address: "пр. Нефтяников 73, Бакинский бульвар",
      description:
        "Смарт-станция на набережной с консолью на уровне инвалидной коляски, голосовыми подсказками и кнопкой вызова SOS.",
    },
  },
  "hp-fountain-square": {
    az: {
      name: "HealthPoint — Fəvvarələr Meydanı",
      neighborhood: "Fəvvarələr Meydanı",
      address: "Nigar Rəfibəyli küç. 12, Fəvvarələr Meydanı",
      description:
        "Mərkəzi piyada zonasında sürətli qan təzyiqi və nəbz yoxlanışı, həmçinin çoxdilli səsli təlimat təqdim edən məntəqə.",
    },
    ru: {
      name: "HealthPoint — Площадь Фонтанов",
      neighborhood: "Площадь Фонтанов",
      address: "ул. Нигяр Рафибейли 12, Площадь Фонтанов",
      description:
        "Центральная пешеходная точка для экспресс-проверки давления и пульса с многоязычными голосовыми инструкциями.",
    },
  },
  "hp-icherisheher": {
    az: {
      name: "HealthPoint — İçərişəhər",
      neighborhood: "İçərişəhər",
      address: "İstiqlaliyyət küç. 19, İçərişəhər metrosu yanı",
      description:
        "Yaşlı vətəndaşlar, piyadalar və turistlər üçün İçərişəhər metrosunun çıxışında pilləsiz əlçatan məntəqə.",
    },
    ru: {
      name: "HealthPoint — Ичеришехер",
      neighborhood: "Ичеришехер",
      address: "ул. Истиглалият 19, у метро Ичеришехер",
      description:
        "Компактная безбарьерная станция у метро Ичеришехер для пожилых жителей, пешеходов и туристов.",
    },
  },
  "hp-28-may": {
    az: {
      name: "HealthPoint — 28 May Metrosu",
      neighborhood: "28 May",
      address: "Füzuli küç. 65, 28 May metrosu çıxışı",
      description:
        "28 May metrosu və avtobus dayanacağının yanında AED (defibrilyator) kabinli yüksək axınlı nəqliyyat qovşağı məntəqəsi.",
    },
    ru: {
      name: "HealthPoint — Метро 28 Мая",
      neighborhood: "28 Мая",
      address: "ул. Физули 65, выход метро 28 Мая",
      description:
        "Транспортная станция с высоким трафиком рядом с метро 28 Мая и автовокзалом, оснащённая дефибриллятором AED.",
    },
  },
  "hp-ganjlik-mall": {
    az: {
      name: "HealthPoint — Gənclik Mall",
      neighborhood: "Gənclik",
      address: "Fətəli xan Xoyski pr. 38, Gənclik",
      description:
        "Gənclik metrosu dayanacağının yanındakı məntəqə. Pulsoksimetr modulu texniki yoxlamadadır (məhdud xidmət).",
    },
    ru: {
      name: "HealthPoint — Гянджлик Молл",
      neighborhood: "Гянджлик",
      address: "пр. Фатали Хана Хойского 38, Гянджлик",
      description:
        "Точка у автобусной остановки метро Гянджлик. Пульсоксиметр на проверке (ограниченный сервис).",
    },
  },
  "hp-heydar-aliyev-center": {
    az: {
      name: "HealthPoint — Heydər Əliyev Mərkəzi",
      neighborhood: "Nərimanov",
      address: "Heydər Əliyev pr. 1, Park Girişi",
      description:
        "Geniş pandus, AED defibrilyatoru və yüksək görünürlüklü təcili yardım paneli ilə təchiz edilmiş park girişi məntəqəsi.",
    },
    ru: {
      name: "HealthPoint — Центр Гейдара Алиева",
      neighborhood: "Нариманов",
      address: "пр. Гейдара Алиева 1, вход в парк",
      description:
        "Станция у входа в парк с широким пандусом, дефибриллятором AED и заметной панелью экстренного вызова.",
    },
  },
  "hp-nizami-street": {
    az: {
      name: "HealthPoint — Nizami küçəsi",
      neighborhood: "Səbail / Nizami",
      address: "Nizami küç. 58, Mərkəzi Bulvar",
      description:
        "Əlil arabası üçün uyğun hündürlükdə yerləşdirilmiş, qan təzyiqi və oksigen ölçən modullu piyada küçəsi məntəqəsi.",
    },
    ru: {
      name: "HealthPoint — Улица Низами",
      neighborhood: "Сабаил / Низами",
      address: "ул. Низами 58, центральный променад",
      description:
        "Уличная станция на уровне коляски с базовым контролем давления и пульсоксиметрией.",
    },
  },
  "hp-sahil-metro": {
    az: {
      name: "HealthPoint — Sahil Metrosu",
      neighborhood: "Sahil",
      address: "Bülbül pr. 14, Sahil metrosu meydanı",
      description:
        "Sensor kalibrləməsi və pandus işıqlandırmasının yenilənməsi səbəbindən demo rejimdə müvəqqəti bağlıdır.",
    },
    ru: {
      name: "HealthPoint — Метро Сахиль",
      neighborhood: "Сахиль",
      address: "пр. Бюльбюля 14, площадь метро Сахиль",
      description:
        "Станция временно отключена в демо-режиме для калибровки датчиков и обновления подсветки пандуса.",
    },
  },
};

export const EQUIPMENT_USAGE_GUIDE: Record<
  EquipmentItem,
  Record<LanguageCode, string>
> = {
  "Blood pressure monitor": {
    az: "Oturaq vəziyyətdə sağ və ya sol qolunuzu manşetə yerləşdirin, 30 saniyə sakit qalın və ekrandakı 'Başla' düyməsini sıxın.",
    en: "Sit comfortably, place your arm inside the cuff at heart height, stay still for 30s, and press Start on the panel.",
    ru: "Сядьте спокойно, поместите руку в манжету на уровне сердца и нажмите «Старт» на экране.",
  },
  "Heart rate monitor": {
    az: "Barmağınızı optik sensora toxundurun və ya tutacaq sensorlarından tutun — nəbz 10 saniyəyə ölçülür.",
    en: "Rest your finger or palms on the sensor pad for 10 seconds to read your resting heart rate.",
    ru: "Приложите палец или ладони к сенсору на 10 секунд для измерения частоты пульса.",
  },
  "Pulse oximeter": {
    az: "Şəhadət barmağınızı təmiz klip sensorunun içinə yerləşdirin; SpO2 və nəbz göstəriciləri ekranda görünəcək.",
    en: "Insert your index finger gently into the clip sensor to display SpO2 oxygen saturation.",
    ru: "Аккуратно вставьте указательный палец в датчик-клипсу для отображения уровня кислорода SpO2.",
  },
  "First-aid kit": {
    az: "Yaşıl qapaqlı ilk yardım bölməsində steril bint, antiseptik salfetlər və yara bandı mövcuddur.",
    en: "Green cabinet compartment contains sterile bandages, antiseptic wipes, and basic wound dressings.",
    ru: "В зелёном отсеке находятся стерильные бинты, антисептические салфетки и пластыри.",
  },
  "SOS communication button": {
    az: "Təcili halda qırmızı SOS düyməsini 2 saniyə basılı saxlayın və ya telefondan 103 / 112-yə zəng edin.",
    en: "Hold the red SOS button for 2 seconds in urgent situations or dial 103 / 112 directly from your device.",
    ru: "Удерживайте красную кнопку SOS 2 секунды при экстренной ситуации или позвоните 103 / 112.",
  },
  AED: {
    az: "Yalnız huşsuz və nəfəs almayan şəxsdə istifadə olunur: qapağı açın və cihazın səsli təlimatına əməl edin (dərhal 103-ə zəng edin).",
    en: "For unresponsive non-breathing emergencies only: open lid, follow voice prompts, and ensure 103 is called.",
    ru: "Только при потере сознания и отсутствии дыхания: откройте крышку, следуйте голосовым командам и вызовите 103.",
  },
};

export function getKioskCode(pointId: string): string {
  if (KIOSK_CODES[pointId]) return KIOSK_CODES[pointId];
  let sum = 0;
  for (let i = 0; i < pointId.length; i += 1) {
    sum = (sum * 31 + pointId.charCodeAt(i)) % 90;
  }
  return `HP-${10 + sum}`;
}

export function resolveLang(language: string): LanguageCode {
  if (language.startsWith("az")) return "az";
  if (language.startsWith("ru")) return "ru";
  return "en";
}

const STATUS_LABELS: Record<LanguageCode, Record<OperationalStatus, string>> = {
  az: {
    operational: "İşləkdir",
    limited: "Məhdud Xidmət",
    unavailable: "Əlçatmazdır",
    unknown: "Naməlum",
  },
  en: {
    operational: "operational",
    limited: "limited",
    unavailable: "unavailable",
    unknown: "unknown",
  },
  ru: {
    operational: "Работает",
    limited: "Ограниченный сервис",
    unavailable: "Недоступно",
    unknown: "Неизвестно",
  },
};

const EQUIPMENT_LABELS: Record<LanguageCode, Record<EquipmentItem, string>> = {
  az: {
    "Blood pressure monitor": "Qan təzyiqi cihazı",
    "Heart rate monitor": "Nəbz ölçən",
    "Pulse oximeter": "Pulsoksimetr",
    "First-aid kit": "İlk yardım çantası",
    "SOS communication button": "SOS çağrı düyməsi",
    AED: "AED (Defibrilyator)",
  },
  en: {
    "Blood pressure monitor": "Blood pressure monitor",
    "Heart rate monitor": "Heart rate monitor",
    "Pulse oximeter": "Pulse oximeter",
    "First-aid kit": "First-aid kit",
    "SOS communication button": "SOS communication button",
    AED: "AED",
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

export function localizeStatusLabel(status: OperationalStatus, language: string): string {
  const code = resolveLang(language);
  return STATUS_LABELS[code][status] ?? status;
}

export function localizeEquipmentLabel(item: EquipmentItem, language: string): string {
  const code = resolveLang(language);
  return EQUIPMENT_LABELS[code][item] ?? item;
}

export function localizeAccessPoint(point: AccessPoint, language: string): AccessPoint {
  const code = resolveLang(language);
  const tr = POINT_TRANSLATIONS[point.id]?.[code];
  if (!tr) return point;
  return {
    ...point,
    name: tr.name,
    neighborhood: tr.neighborhood,
    address: tr.address,
    description: tr.description,
  };
}
