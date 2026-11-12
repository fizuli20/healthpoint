import type {
  AccessPoint,
  EquipmentItem,
  LanguageCode,
  MaintenanceReport,
  OperationalStatus,
  PlacementZone,
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
  "hp-koroglu-hub": "HP-09",
  "hp-narimanov-park": "HP-10",
  "hp-elmler-academy": "HP-11",
  "hp-memar-ajami": "HP-12",
  "hp-white-city": "HP-13",
  "hp-ahmedli-metro": "HP-14",
  "hp-port-baku": "HP-15",
};

interface LocalizedFields {
  name: string;
  neighborhood: string;
  address: string;
  description: string;
  placementReason: string;
}

const POINT_TRANSLATIONS: Record<string, Partial<Record<LanguageCode, LocalizedFields>>> = {
  "hp-baku-boulevard": {
    az: {
      name: "OpenCarePoint — Dənizkənarı Bulvar",
      neighborhood: "Səbail / Bulvar",
      address: "Neftçilər pr. 73, Bakı Bulvarı",
      description:
        "Bakı Bulvarı boyunca əlil arabası səviyyəsində sensor paneli, səsli təlimat və ictimai SOS çağrı düyməsi olan ağıllı sağlamlıq məntəqəsi.",
      placementReason:
        "Avtomobilsiz sahilyanı piyada və qaçış zonasıdır; təcili yardım girişindən əvvəl yüksək yaşlı və turist axınına ilk yardım və AED dəstəyi verir.",
    },
    ru: {
      name: "OpenCarePoint — Приморский бульвар",
      neighborhood: "Сабаил / Бульвар",
      address: "пр. Нефтяников 73, Бакинский бульвар",
      description:
        "Смарт-станция на набережной с консолью на уровне инвалидной коляски, голосовыми подсказками и кнопкой вызова SOS.",
      placementReason:
        "Пешеходная прибрежная зона с высоким потоком людей, где доступ скорой требует координации въезда; критична для первой помощи и AED.",
    },
  },
  "hp-fountain-square": {
    az: {
      name: "OpenCarePoint — Fəvvarələr Meydanı",
      neighborhood: "Fəvvarələr Meydanı",
      address: "Nigar Rəfibəyli küç. 12, Fəvvarələr Meydanı",
      description:
        "Mərkəzi piyada zonasında sürətli qan təzyiqi və nəbz yoxlanışı, həmçinin çoxdilli səsli təlimat təqdim edən məntəqə.",
      placementReason:
        "Nəqliyyata bağlı mərkəzi meydanda 24/7 yüksək sıxlıq mövcuddur; təcili maşın yaxınlaşana qədər ilkin triaj təmin edir.",
    },
    ru: {
      name: "OpenCarePoint — Площадь Фонтанов",
      neighborhood: "Площадь Фонтанов",
      address: "ул. Нигяр Рафибейли 12, Площадь Фонтанов",
      description:
        "Центральная пешеходная точка для экспресс-проверки давления и пульса с многоязычными голосовыми инструкциями.",
      placementReason:
        "Плотная пешеходная зона без проезда авто 24/7; обеспечивает быстрый первичный скрининг до прибытия 103.",
    },
  },
  "hp-icherisheher": {
    az: {
      name: "OpenCarePoint — İçərişəhər",
      neighborhood: "İçərişəhər",
      address: "İstiqlaliyyət küç. 19, İçərişəhər metrosu yanı",
      description:
        "Yaşlı vətəndaşlar, piyadalar və turistlər üçün İçərişəhər metrosunun çıxışında pilləsiz əlçatan məntəqə.",
      placementReason:
        "Dar və enişli İçərişəhər küçələrində yaşayan yaşlı sakinlər üçün metro çıxışında pilləsiz ölçüm məntəqəsi vaxt itkisini aradan qaldırır.",
    },
    ru: {
      name: "OpenCarePoint — Ичеришехер",
      neighborhood: "Ичеришехер",
      address: "ул. Истиглалият 19, у метро Ичеришехер",
      description:
        "Компактная безбарьерная станция у метро Ичеришехер для пожилых жителей, пешеходов и туристов.",
      placementReason:
        "Обслуживает пожилых жителей узких кварталов Старого города прямо у выхода метро с безбарьерным пандусом.",
    },
  },
  "hp-28-may": {
    az: {
      name: "OpenCarePoint — 28 May Metrosu",
      neighborhood: "28 May",
      address: "Füzuli küç. 65, 28 May metrosu çıxışı",
      description:
        "28 May metrosu və avtobus dayanacağının yanında AED (defibrilyator) kabinli yüksək axınlı nəqliyyat qovşağı məntəqəsi.",
      placementReason:
        "Bakının əsas dəmiryolu, metro və avtobus kəsişməsidir; sutkalıq pik sərnişin axını 24/7 AED və təzyiq nəzarətini zəruri edir.",
    },
    ru: {
      name: "OpenCarePoint — Метро 28 Мая",
      neighborhood: "28 Мая",
      address: "ул. Физули 65, выход метро 28 Мая",
      description:
        "Транспортная станция с высоким трафиком рядом с метро 28 Мая и автовокзалом, оснащённая дефибриллятором AED.",
      placementReason:
        "Ключевой пересадочный узел метро и железной дороги в Баку; высокий пассажиропоток требует круглосуточного AED.",
    },
  },
  "hp-ganjlik-mall": {
    az: {
      name: "OpenCarePoint — Gənclik Mall",
      neighborhood: "Gənclik",
      address: "Fətəli xan Xoyski pr. 38, Gənclik",
      description:
        "Gənclik metrosu dayanacağının yanındakı məntəqə. Pulsoksimetr modulu texniki yoxlamadadır (məhdud xidmət).",
      placementReason:
        "Ticarət mərkəzi, stadion və şimal yaşayış istiqamətini birləşdirən yüksək yüklü nəqliyyat dəhlizidir.",
    },
    ru: {
      name: "OpenCarePoint — Гянджлик Молл",
      neighborhood: "Гянджлик",
      address: "пр. Фатали Хана Хойского 38, Гянджлик",
      description:
        "Точка у автобусной остановки метро Гянджлик. Пульсоксиметр на проверке (ограниченный сервис).",
      placementReason:
        "Оживлённый торговый и стадионный коридор, соединяющий центр города с северными микрорайонами.",
    },
  },
  "hp-heydar-aliyev-center": {
    az: {
      name: "OpenCarePoint — Heydər Əliyev Mərkəzi",
      neighborhood: "Nərimanov",
      address: "Heydər Əliyev pr. 1, Park Girişi",
      description:
        "Geniş pandus, AED defibrilyatoru və yüksək görünürlüklü təcili yardım paneli ilə təchiz edilmiş park girişi məntəqəsi.",
      placementReason:
        "Açıq park, ailəvi istirahət və açıq hava idman məkanı olduğuna görə aydın görünən girişdə AED yerləşdirilib.",
    },
    ru: {
      name: "OpenCarePoint — Центр Гейдара Алиева",
      neighborhood: "Нариманов",
      address: "пр. Гейдара Алиева 1, вход в парк",
      description:
        "Станция у входа в парк с широким пандусом, дефибриллятором AED и заметной панелью экстренного вызова.",
      placementReason:
        "Крупная открытая парковая зона для семей и спорта, где заметная точка с AED ускоряет реагирование.",
    },
  },
  "hp-nizami-street": {
    az: {
      name: "OpenCarePoint — Nizami küçəsi",
      neighborhood: "Səbail / Nizami",
      address: "Nizami küç. 58, Mərkəzi Bulvar",
      description:
        "Əlil arabası üçün uyğun hündürlükdə yerləşdirilmiş, qan təzyiqi və oksigen ölçən modullu piyada küçəsi məntəqəsi.",
      placementReason:
        "Sıx piyada ticarət küçəsində parklanma olmadığından, tıxaclı küçədə ilkin göstəricilərin yerində ölçülməsini təmin edir.",
    },
    ru: {
      name: "OpenCarePoint — Улица Низами",
      neighborhood: "Сабаил / Низами",
      address: "ул. Низами 58, центральный променад",
      description:
        "Уличная станция на уровне коляски с базовым контролем давления и пульсоксиметрией.",
      placementReason:
        "На оживлённом пешеходном променаде без парковки обеспечивает проверку витальных показателей до приезда помощи.",
    },
  },
  "hp-sahil-metro": {
    az: {
      name: "OpenCarePoint — Sahil Metrosu",
      neighborhood: "Sahil",
      address: "Bülbül pr. 14, Sahil metrosu meydanı",
      description:
        "Sensor kalibrləməsi və pandus işıqlandırmasının yenilənməsi səbəbindən demo rejimdə müvəqqəti bağlıdır.",
      placementReason:
        "Texniki nasazlıq zamanı şəffaf xəbərdarlığı göstərir və vətəndaşları yaxınlıqdakı 28 May və ya Bulvar məntəqələrinə yönləndirir.",
    },
    ru: {
      name: "OpenCarePoint — Метро Сахиль",
      neighborhood: "Сахиль",
      address: "пр. Бюльбюля 14, площадь метро Сахиль",
      description:
        "Станция временно отключена в демо-режиме для калибровки датчиков и обновления подсветки пандуса.",
      placementReason:
        "Демонстрирует прозрачное оповещение о ремонте и перенаправление граждан к ближайшим рабочим станциям.",
    },
  },
  "hp-koroglu-hub": {
    az: {
      name: "OpenCarePoint — Koroğlu Nəqliyyat Qovşağı",
      neighborhood: "Nizami / Koroğlu",
      address: "Heydər Əliyev pr. 115, Koroğlu Qovşağı",
      description:
        "Şərq istiqamətli metro və qəsəbələrarası avtobus qovşağında sürətli nəbz, təzyiq və AED dəstəyi təqdim edən 24/7 məntəqə.",
      placementReason:
        "Şəhərətrafı qəsəbələri və hava limanı xəttini birləşdirən ən böyük şərq nəqliyyat qovşağıdır; mərkəzdən kənar 24/7 əhatə yaradır.",
    },
    ru: {
      name: "OpenCarePoint — Транспортный узел Кёроглу",
      neighborhood: "Низами / Кёроглу",
      address: "пр. Гейдара Алиева 115, узел Кёроглу",
      description:
        "Круглосуточный киоск на восточном пересадочном узле метро и пригородных автобусов с пульсометром, тонометром и AED.",
      placementReason:
        "Крупнейший восточный транспортный узел, связывающий пригороды и направление аэропорта, закрывая разрыв вне центра.",
    },
  },
  "hp-narimanov-park": {
    az: {
      name: "OpenCarePoint — Nərimanov Parkı",
      neighborhood: "Nərimanov",
      address: "Təbriz küç. 44, Nərimanov metrosu və parkı",
      description:
        "Yaşlı sakinlərin gündəlik qan təzyiqi və nəbz nəzarəti üçün Nərimanov parkı girişində quraşdırılmış əlçatan məntəqə.",
      placementReason:
        "Yaşlı əhalinin sıx yaşadığı massiv və park ərazisidir; poliklinika saatlarından kənar müntəzəm hipertoniya yoxlamasını asanlaşdırır.",
    },
    ru: {
      name: "OpenCarePoint — Парк Нариманова",
      neighborhood: "Нариманов",
      address: "ул. Тебриз 44, метро и парк Нариманова",
      description:
        "Доступная станция у входа в парк для ежедневного контроля давления и пульса пожилыми жителями района.",
      placementReason:
        "Плотный жилой район с высокой долей пожилых граждан у парка; упрощает регулярный контроль давления.",
    },
  },
  "hp-elmler-academy": {
    az: {
      name: "OpenCarePoint — Elmlər Akademiyası / BDU",
      neighborhood: "Yasamal / Elmlər",
      address: "Zahid Xəlilov küç. 23, Elmlər Akademiyası metrosu",
      description:
        "Bakı Dövlət Universiteti və Akademiya şəhərciyi tələbələri, müəllimləri və Yasamal sakinləri üçün tam sensorlu və AED-li məntəqə.",
      placementReason:
        "BDU, Texniki Universitet və AMEA kampusunda gündəlik 40.000+ tələbə və əməkdaşa xidmət edir; qərbi Bakı əhatəsini gücləndirir.",
    },
    ru: {
      name: "OpenCarePoint — Эльмляр Академиясы (БГУ)",
      neighborhood: "Ясамал / Эльмляр",
      address: "ул. Захида Халилова 23, метро Эльмляр Академиясы",
      description:
        "Университетская станция у БГУ и Академгородка с полным набором датчиков и дефибриллятором AED.",
      placementReason:
        "Охватывает кампусы БГУ и Академии наук с ежедневным потоком более 40 тыс. студентов и жителей Ясамала.",
    },
  },
  "hp-memar-ajami": {
    az: {
      name: "OpenCarePoint — Memar Əcəmi Qovşağı",
      neighborhood: "Nəsimi / 3-cü mikrorayon",
      address: "Cavadxan küç. 18, Memar Əcəmi metrosu",
      description:
        "Şimal-qərb yaşayış mikrorayonları üçün 24/7 fəaliyyət göstərən Yaşıl/Bənövşəyi metro keçidi tibbi məntəqəsi.",
      placementReason:
        "Şimal-qərb mikrorayonlarının iki xəttli metro qovşağında boşluğu bağlayır və gecə saatlarında təhlükəsiz AED çıxışı yaradır.",
    },
    ru: {
      name: "OpenCarePoint — Мемар Аджеми",
      neighborhood: "Насими / 3-й микрорайон",
      address: "ул. Джавадхана 18, метро Мемар Аджеми",
      description:
        "Круглосуточная станция на пересадке Зелёной и Фиолетовой линий метро для жителей северо-западных микрорайонов.",
      placementReason:
        "Закрывает дефицит инфраструктуры на северо-западе Баку в густонаселённом жилом узле двух линий метро.",
    },
  },
  "hp-white-city": {
    az: {
      name: "OpenCarePoint — Bakı Ağ Şəhər Bulvarı",
      neighborhood: "Xətai / Ağ Şəhər",
      address: "Süleyman Vəzirov küç. 11, Ağ Şəhər Parkı",
      description:
        "Ağ Şəhər sahil bulvarı boyunca qaçışçılar, velosipedçilər və ailələr üçün SpO2, nəbz və AED-li 24/7 məntəqə.",
      placementReason:
        "Sürətlə inkişaf edən şərq sahil bulvarında idman sonrası nəbz/oksigen nəzarəti və qəfil ürək hadisələrində AED dəstəyi verir.",
    },
    ru: {
      name: "OpenCarePoint — Белый Город Бульвар",
      neighborhood: "Хатаи / Белый Город",
      address: "ул. Сулеймана Везирова 11, парк Белый Город",
      description:
        "Круглосуточный киоск на восточной набережной с контролем SpO2, пульса и AED для бегунов, велосипедистов и семей.",
      placementReason:
        "Поддерживает активную восточную прогулочную набережную и связывает центральный бульвар с Хатаинским районом.",
    },
  },
  "hp-ahmedli-metro": {
    az: {
      name: "OpenCarePoint — Əhmədli Metrosu",
      neighborhood: "Xətai / Əhmədli",
      address: "Məhəmməd Hadi küç. 51, Əhmədli metrosu çıxışı",
      description:
        "Əhalisi sıx Əhmədli massivində 24/7 ödənişsiz nəbz, təzyiq ölçümü və SOS çağrısı təqdim edən məhəllə məntəqəsi.",
      placementReason:
        "Bakının ən sıx məskunlaşmış şərq yaşayış massivlərindən biridir; 103 gələnə qədər yaşlı sakinlər üçün əlçatanlığı artırır.",
    },
    ru: {
      name: "OpenCarePoint — Метро Ахмедли",
      neighborhood: "Хатаи / Ахмедли",
      address: "ул. Магомеда Хади 51, выход метро Ахмедли",
      description:
        "Круглосуточный районный киоск с бесплатным пульсом, тонометром и кнопкой SOS в густонаселённом массиве Ахмедли.",
      placementReason:
        "Один из самых плотно заселённых восточных жилых массивов; снижает риск задержки помощи до прибытия 103.",
    },
  },
  "hp-port-baku": {
    az: {
      name: "OpenCarePoint — Port Baku / Xətai Sahili",
      neighborhood: "Nəsimi / Port Baku",
      address: "Üzeyir Hacıbəyli küç. 62, Port Baku Girişi",
      description:
        "İş mərkəzi və sahil zolağı üçün korporativ sağlamlıq məntəqəsi. Təzyiq manşeti kalibrləmədədir (məhdud xidmət).",
      placementReason:
        "Ofis əməkdaşları və B2B korporativ abunəliklər üçün əsas biznes mərkəzi nöqtəsi olub, Mərkəzlə Ağ Şəhəri birləşdirir.",
    },
    ru: {
      name: "OpenCarePoint — Port Baku / Приморье",
      neighborhood: "Насими / Port Baku",
      address: "ул. Узеира Гаджибейли 62, вход Port Baku",
      description:
        "Деловая и приморская станция велнес-мониторинга. Манжета давления проходит калибровку (ограниченный сервис).",
      placementReason:
        "Опорная B2B-точка для корпоративных подписок офисных сотрудников, связывающая центр с Белым Городом.",
    },
  },
};

const ZONE_LABELS: Record<LanguageCode, Record<PlacementZone, string>> = {
  az: {
    transit_hub: "Nəqliyyat Qovşağı",
    residential: "Yaşayış Massivi",
    recreation: "İstirahət / Bulvar",
    university: "Universitet / Təhsil",
    business: "İş / Ticarət Mərkəzi",
  },
  en: {
    transit_hub: "Transit Hub",
    residential: "Residential District",
    recreation: "Park & Waterfront",
    university: "University Campus",
    business: "Business District",
  },
  ru: {
    transit_hub: "Транспортный узел",
    residential: "Жилой массив",
    recreation: "Парк / Набережная",
    university: "Университетский кампус",
    business: "Деловой центр",
  },
};

export function localizePlacementZone(zone: PlacementZone | undefined, language: string): string {
  if (!zone) return "";
  const code = resolveLang(language);
  return ZONE_LABELS[code][zone] ?? zone;
}

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
    sum = (sum * 31 + pointId.charCodeAt(i)) % 85;
  }
  return `HP-${16 + sum}`;
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
    placementReason: tr.placementReason ?? point.placementReason,
  };
}

const DEMO_REPORT_TRANSLATIONS: Record<
  string,
  Partial<
    Record<
      LanguageCode,
      { description: string; assignedTo?: string; notes?: string }
    >
  >
> = {
  "rep-demo-1": {
    az: {
      description: "Pulsoksimetr barmaq sensoru kabelində fasiləli qopma müşahidə olunur.",
      assignedTo: "Səyyar Texniki Komanda A",
      notes: "Əvəzləyici modul günorta marşrutu üçün planlaşdırılıb.",
    },
    ru: {
      description: "Наблюдается периодическое отключение кабеля датчика пульсоксиметра.",
      assignedTo: "Выездная техбригада A",
      notes: "Замена модуля запланирована на дневной маршрут.",
    },
  },
  "rep-demo-2": {
    az: {
      description: "Sensorlu ekran zəifləyib; profilaktik kalibrləmə xidməti açılıb.",
    },
    ru: {
      description: "Сенсорный экран тусклый; открыта заявка на профилактическую калибровку.",
    },
  },
  "rep-demo-3": {
    az: {
      description: "Avtomatik qan təzyiqi manşeti klapanının təzyiq yoxlaması planlaşdırılıb.",
      assignedTo: "Səyyar Texniki Komanda B",
      notes: "Ehtiyat manşet Xətai deposundan göndərilib.",
    },
    ru: {
      description: "Запланирована проверка клапана давления автоматической манжеты тонометра.",
      assignedTo: "Выездная техбригада B",
      notes: "Запасная манжета отправлена со склада Хатаи.",
    },
  },
};

export function localizeMaintenanceReport(
  report: MaintenanceReport,
  language: string
): MaintenanceReport {
  const code = resolveLang(language);
  const tr = DEMO_REPORT_TRANSLATIONS[report.id]?.[code];
  if (!tr) return report;
  return {
    ...report,
    description: tr.description,
    assignedTo: tr.assignedTo ?? report.assignedTo,
    notes: tr.notes ?? report.notes,
  };
}
