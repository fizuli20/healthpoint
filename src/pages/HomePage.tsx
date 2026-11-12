import { useState } from "react";
import {
  Accessibility,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Eye,
  Heart,
  Layers,
  MapPin,
  Monitor,
  PhoneCall,
  Play,
  Shield,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { HealthPointWordmark } from "../components/BrandLogo";
import { DEMO_ACCESS_POINTS } from "../data/bakuDemoPoints";
import { getKioskCode } from "../lib/localizePoint";

export function HomePage() {
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  const hotspots = [
    {
      id: 1,
      title: "Sensorlu Sensor Ekran",
      desc: "Geniş formatlı 1080p sensor panel, 56-72px rahat toxunma hədəfləri və yüksək kontrast rejimi.",
      top: "28%",
      left: "48%",
    },
    {
      id: 2,
      title: "Steril Ölçmə Cihazı Yuvası",
      desc: "Köşk tərəfindən təmin edilən və hər istifadədən sonra dezinfeksiya edilən simsiz sensor.",
      top: "54%",
      left: "64%",
    },
    {
      id: 3,
      title: "NFC Toxunuş Sahəsi",
      desc: "Şəxsi smartfonu toxunduraraq həkimlə tele-məsləhət handoff-unu başladan NFC modulu.",
      top: "65%",
      left: "36%",
    },
    {
      id: 4,
      title: "Təcili Yardım Çağırış Düyməsi",
      desc: "Telefon tələb etmədən köşkün dəqiq geolokasiyasını 103 dispetçerinə ötürən fiziki/rəqəmsal SOS.",
      top: "42%",
      left: "30%",
    },
    {
      id: 5,
      title: "Pilləsiz Pandus & Əlçatan Yerləşmə",
      desc: "Təkərli araba istifadəçiləri və uşaq arabası ilə olan valideynlər üçün maneəsiz 1:12 eniş.",
      top: "88%",
      left: "50%",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171717] font-sans selection:bg-red-100 selection:text-red-900 overflow-x-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative pt-6 pb-16 sm:pb-24 border-b border-[#E8E3DE] bg-gradient-to-b from-white to-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="focus:outline-none">
              <HealthPointWordmark />
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/map"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E8E3DE] text-xs font-bold text-[#171717] hover:border-[#C8102E] transition shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-[#C8102E]" />
                <span>Xəritəyə bax</span>
              </Link>
              <Link
                to="/demo"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs font-black text-amber-900 hover:bg-amber-100 transition shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Münsiflər Bələdçisi</span>
              </Link>
              <Link
                to="/kiosk"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-black hover:bg-[#8B1028] transition shadow-md"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Köşkü sına</span>
              </Link>
            </div>
          </div>

          {/* Hero Content */}
          <div className="text-center space-y-6 max-w-4xl mx-auto pt-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-[#8B1028] text-xs font-black shadow-sm">
              <Heart className="w-3.5 h-3.5 fill-[#C8102E]" />
              <span>Human-Centered Cities Hackathon • Team CiviCore</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#171717] leading-[1.1]">
              Sağlamlığa daha yaxın şəhər.
            </h1>

            <p className="text-base sm:text-xl text-[#61666D] max-w-2xl mx-auto leading-relaxed">
              OpenCare Point ictimai məkanlarda nəbzinizi ölçə, nəticəni ekranda görə və tibbi
              yardım istəyə biləcəyiniz ağıllı sağlamlıq məntəqəsidir.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link
                to="/kiosk"
                className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#C8102E] text-white font-extrabold text-sm sm:text-base hover:bg-[#8B1028] transition-all shadow-lg shadow-red-900/20 transform hover:-translate-y-0.5"
              >
                <Monitor className="w-5 h-5" />
                <span>Köşkü sına</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/video"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-white border border-[#E8E3DE] text-[#171717] font-bold text-sm sm:text-base hover:border-[#C8102E] transition shadow-sm"
              >
                <Play className="w-4 h-4 text-[#C8102E] fill-current" />
                <span>Demo videosuna bax</span>
              </Link>

              <Link
                to="/map"
                className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] text-[#171717] font-bold text-sm sm:text-base hover:border-gray-400 transition"
              >
                <MapPin className="w-4 h-4 text-[#C8102E]" />
                <span>15 Məntəqəlik Bakı Xəritəsi</span>
              </Link>
            </div>

            {/* Value Indicators */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold text-[#61666D]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Telefon tələb olunmur
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Əsas xidmətlər ödənişsizdir
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Hər kəs üçün əlçatan dizayn
              </span>
            </div>
          </div>

          {/* Interactive Kiosk Visualization */}
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden bg-white border border-[#E8E3DE] shadow-xl p-4 sm:p-8">
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 flex items-center justify-center min-h-[380px] sm:min-h-[500px]">
              <img
                src="/assets/kiosk/kiosk_concept.png"
                alt="OpenCare Point fiziki köşk konsepti"
                className="w-full h-auto max-h-[520px] object-contain opacity-95"
              />

              {/* Interactive Hotspots */}
              {hotspots.map((spot) => (
                <button
                  key={spot.id}
                  type="button"
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  style={{ top: spot.top, left: spot.left }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#C8102E] text-white font-black text-xs flex items-center justify-center shadow-lg border-2 border-white hover:scale-125 transition-transform animate-pulse"
                  title={spot.title}
                >
                  {spot.id}
                </button>
              ))}

              {/* Active Hotspot Info Card */}
              {activeHotspot !== null && (
                <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E8E3DE] shadow-2xl text-[#171717] space-y-1 text-left animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase text-[#C8102E]">
                      Hotspot #{activeHotspot}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveHotspot(null)}
                      className="text-xs text-gray-400 hover:text-black"
                    >
                      ✕
                    </button>
                  </div>
                  <h4 className="font-extrabold text-sm text-[#171717]">
                    {hotspots.find((h) => h.id === activeHotspot)?.title}
                  </h4>
                  <p className="text-xs text-[#61666D] leading-relaxed">
                    {hotspots.find((h) => h.id === activeHotspot)?.desc}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-[#61666D]">
              <span className="font-medium">
                💡 Köşkün funksiyalarını öyrənmək üçün nömrələnmiş nöqtələrin üzərinə vurun.
              </span>
              <span className="font-bold text-[#C8102E]">
                Konsept Qrafikası • Aparat Prototipi
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROBLEM SECTION (BAKU STREET SCENARIOS) ================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E3DE] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
              Şəhər Problemi
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Küçədə qəfil narahatlıq hiss etdikdə nə edirsiniz?
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Bakının izdihamlı məkanlarında hər gün minlərlə vətəndaş təzyiq sıçrayışı, nəbz
              sürətlənməsi və ya halsızlıqla üzləşir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E] font-black">
                01
              </div>
              <h3 className="text-lg font-extrabold text-[#171717]">Qəfil narahatlıq</h3>
              <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                Nərimanov parkında və ya Elmlər Akademiyasında gəzərkən təqaüdçü müəllim Tofiq dayının
                qəfil ürəyi sıxılır və başı gicəllənir.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800 font-black">
                02
              </div>
              <h3 className="text-lg font-extrabold text-[#171717]">
                Tibbi dəstəyə çıxış çətinliyi
              </h3>
              <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                Yaxınlıqda aptek və ya poliklinika yoxdur. Telefonun batareyası bitib və ya yaşlı insan
                mürəkkəb mobil tətbiqlərdən istifadə edə bilmir.
              </p>
            </div>

            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black">
                03
              </div>
              <h3 className="text-lg font-extrabold text-[#171717]">
                Əlçatan infrastruktur ehtiyacı
              </h3>
              <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                Şəhərin ehtiyacı olan həll: Bir addımlıqda, ödənişsiz, heç bir smartfon tələb etmədən
                nəbzi ölçən və lazım olduqda 103 xidmətinə dəqiq yer ötürən köşkdür.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (VISUAL SEQUENCE) ================= */}
      <section id="how-it-works" className="py-16 sm:py-24 border-b border-[#E8E3DE] bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
              İstifadə Ardıcıllığı
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Ölç. Nəticəni gör. Yardım istə.
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Heç bir qeydiyyat, ödəniş və ya smartfon tələb olunmur.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
              <div className="text-2xl font-black text-[#C8102E]">01</div>
              <h4 className="font-extrabold text-base text-[#171717]">Cihazı götür</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Köşkün steril yuvasında saxlanılan optik ölçmə cihazını çıxarın.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
              <div className="text-2xl font-black text-[#C8102E]">02</div>
              <h4 className="font-extrabold text-base text-[#171717]">Nəbzini ölç</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Cihazı göstərici barmağınıza taxın və 15 saniyə əlinizi sabit saxlayın.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
              <div className="text-2xl font-black text-[#C8102E]">03</div>
              <h4 className="font-extrabold text-base text-[#171717]">Nəticəni gör</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Böyük ekranda dəqiq nəbzinizi və siqnal keyfiyyəti (SQI) faizini oxuyun.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
              <div className="text-2xl font-black text-[#C8102E]">04</div>
              <h4 className="font-extrabold text-base text-[#171717]">Yardım istə</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Ehtiyac olduqda birbaşa köşkdən təcili yardım və ya smartfonla həkim zəngi seçin.
              </p>
            </div>
          </div>

          {/* Two Distinct Pathways Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="p-7 rounded-3xl bg-white border-2 border-red-200 space-y-4">
              <div className="flex items-center gap-2 text-[#C8102E] font-black text-xs uppercase">
                <PhoneCall className="w-4 h-4" />
                <span>Birinci Yol: Köşk Təcili Yardımı</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#171717]">
                Smartfonsuz Birbaşa Təcili Çağırış
              </h3>
              <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                Telefonunuz olmasa belə, köşkün sensor ekranındakı qırmızı təcili düymə ilə 103
                dispetçerinə məntəqənin dəqiq GPS ünvanı və stansiya kodu ötürülür.
              </p>
              <div className="text-xs font-bold text-[#C8102E]">
                ✓ Telefon tələb olunmur • Pulsuz xidmət
              </div>
            </div>

            <div className="p-7 rounded-3xl bg-white border-2 border-blue-200 space-y-4">
              <div className="flex items-center gap-2 text-blue-700 font-black text-xs uppercase">
                <Smartphone className="w-4 h-4" />
                <span>İkinci Yol: NFC Həkim Handoff-u</span>
              </div>
              <h3 className="text-xl font-extrabold text-[#171717]">
                Şəxsi Smartfonla Həkim Tele-Zəngi
              </h3>
              <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                Şəxsi telefonunuz varsa, onu köşkün NFC sahəsinə toxunduraraq növbətçi həkimlə səsli
                məsləhət seansını dərhal mobil cihazınıza keçirə bilərsiniz.
              </p>
              <div className="text-xs font-bold text-blue-700">
                ✓ Şəxsi və məxfi • Rahat audio bağlantı
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= THREE CONNECTED PRODUCTS ECOSYSTEM ================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E3DE] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
              Vahid Ekosistem
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Üç bir-birinə bağlı təcrübə
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              Fiziki köşk, vətəndaş mobil tətbiqi və şəhər idarəetmə mərkəzi vahid məlumat bazası ilə
              işləyir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Experience 1: Kiosk */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E]">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#171717]">OpenCare Kiosk</h3>
                <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                  Fiziki köşkün sensor ekranı üçün hazırlanmış, böyük düyməli, tam anonim və
                  əlçatan sensor interfeys.
                </p>
              </div>
              <Link
                to="/kiosk"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#C8102E] hover:underline"
              >
                <span>Köşk ekranını aç</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Experience 2: Citizen Connect */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#171717]">OpenCare Connect</h3>
                <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                  Vətəndaşlar üçün stansiyaları xəritədə tapmaq, əlçatanlığı yoxlamaq və piyada naviqasiyası
                  almaq üçün mobil tətbiq.
                </p>
              </div>
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-700 hover:underline"
              >
                <span>Vətəndaş xəritəsinə bax</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Experience 3: City Municipal */}
            <div className="p-7 rounded-3xl bg-[#FAF7F2] border border-[#E8E3DE] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold text-[#171717]">OpenCare City</h3>
                <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
                  Bələdiyyə və operatorlar üçün 15 stansiyanın telemetriyasını, sessiyaları və təmir
                  qeydlərini izləyən mərkəz.
                </p>
              </div>
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-800 hover:underline"
              >
                <span>Bələdiyyə panelinə keç</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ACCESSIBILITY SECTION ================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E3DE] bg-[#FAF7F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
              İnklüzivlik & Əlçatanlıq
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
              Hər bir vətəndaş üçün düşünülmüş dizayn
            </h2>
            <p className="text-sm sm:text-base text-[#61666D]">
              OpenCare Point yalnız gənc smartfon istifadəçiləri üçün deyil, xüsusilə həssas
              təbəqələr üçün layihələndirilib.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E]">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-[#171717]">Yaşlı vətəndaşlar</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Böyük şriftlər (24-40px), aydın addım-addım təlimat və mürəkkəb menyuların
                olmaması.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700">
                <Accessibility className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-[#171717]">Təkərli araba istifadəçiləri</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Pilləsiz pandus, 85 sm hündürlüyündə sensor ekran və rahat yanaşma zonası.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-[#171717]">Görmə zəifliyi</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Yüksək kontrastlı qara-sarı rejim, səsli rəhbərlik (TTS) və toxunma taktil
                nöqtələri.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
                <Shield className="w-5 h-5" />
              </div>
              <h4 className="font-extrabold text-base text-[#171717]">Smartfonsuz şəxslər</h4>
              <p className="text-xs text-[#61666D] leading-relaxed">
                Bütün əsas nəbz ölçümü və təcili yardım funksiyaları heç bir xarici cihaz olmadan
                işləyir.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium">
            ℹ️ Qeyd: Yuxarıdakı fiziki əlçatanlıq xüsusiyyətləri köşkün sənaye dizayn tələbləridir.
            Proqram təminatı əlçatanlığı isə WCAG 2.2 AA standartlarına uyğun hazırlanmışdır.
          </div>
        </div>
      </section>

      {/* ================= BAKU 15-STATION NETWORK PREVIEW ================= */}
      <section className="py-16 sm:py-24 border-b border-[#E8E3DE] bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-3 max-w-2xl">
              <span className="text-xs font-black uppercase tracking-wider text-[#C8102E]">
                Şəhər Şəbəkəsi
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
                Bakıda 15 demo məntəqə
              </h2>
              <p className="text-sm sm:text-base text-[#61666D]">
                Metro çıxışları, parklar, nəqliyyat qovşaqları və universitetləri birləşdirən
                pilot şəbəkə.
              </p>
            </div>

            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-[#C8102E] text-white text-xs font-extrabold hover:bg-[#8B1028] transition shadow-md shrink-0"
            >
              <MapPin className="w-4 h-4" />
              <span>Bütün Məntəqələri Xəritədə Aç</span>
            </Link>
          </div>

          {/* Quick Station Grid Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_ACCESS_POINTS.slice(0, 6).map((pt) => (
              <div
                key={pt.id}
                className="p-5 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] flex items-center justify-between gap-3 hover:border-[#C8102E] transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-red-100 text-[#8B1028]">
                      {getKioskCode(pt.id)}
                    </span>
                    <h4 className="font-extrabold text-sm text-[#171717]">{pt.name}</h4>
                  </div>
                  <p className="text-xs text-[#61666D]">📍 {pt.address}</p>
                </div>
                <Link
                  to={`/kiosk/${pt.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[#E8E3DE] text-xs font-bold text-[#C8102E] hover:bg-red-50 shrink-0"
                >
                  Köşk →
                </Link>
              </div>
            ))}
          </div>

          <p className="text-xs text-[#61666D] text-center">
            ⚠️ Qeyd: Bu məntəqələr Bakı üzrə simulyasiya edilmiş pilot yerləşmə yerləridir.
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 bg-white border-t border-[#E8E3DE] text-[#61666D] text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <HealthPointWordmark />
            <div className="flex flex-wrap items-center gap-6 font-bold">
              <Link to="/kiosk" className="hover:text-black">
                Köşk İnterfeysi
              </Link>
              <Link to="/map" className="hover:text-black">
                Vətəndaş Xəritəsi
              </Link>
              <Link to="/technology" className="hover:text-black">
                Texnologiya
              </Link>
              <Link to="/partners" className="hover:text-black">
                Tərəfdaşlıq & B2G
              </Link>
              <Link to="/demo" className="hover:text-black">
                Münsiflər Bələdçisi
              </Link>
              <Link to="/admin" className="hover:text-black">
                OpenCare City
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>
              © 2026 OpenCare Point • CiviCore Komandası • Human-Centered Cities Hackathon, Bakı.
            </p>
            <p className="font-medium text-gray-400">
              Hakaton prototipi — real tibbi diaqnozu əvəz etmir.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
