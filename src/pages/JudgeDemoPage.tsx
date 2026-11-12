import { useState } from "react";
import {
  ExternalLink,
  Monitor,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
  calculateDemoMetrics,
  clearDemoEvents,
  dispatchDemoEvent,
} from "../services/demoEventStore";

export function JudgeDemoPage() {
  const navigate = useNavigate();
  const [activeScenario, setActiveScenario] = useState<"A" | "B" | "C" | "D">("A");
  const [metrics, setMetrics] = useState(calculateDemoMetrics());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const handleResetDemo = () => {
    clearDemoEvents();
    setMetrics(calculateDemoMetrics());
    setActionNotice("Bütün nümayiş hadisələri sıfırlandı.");
    setTimeout(() => setActionNotice(null), 3000);
  };

  const launchScenarioA = () => {
    // Scenario A: Citizen without smartphone
    dispatchDemoEvent("kiosk_session_started", "point-10", "HP-10", {
      scenario: "A_without_smartphone",
      persona: "Tofiq dayı, 67 yaş",
    });
    navigate("/kiosk/point-10");
  };

  const launchScenarioB = () => {
    // Scenario B: Signal quality failure & retry
    dispatchDemoEvent("kiosk_session_started", "point-10", "HP-10", {
      scenario: "B_signal_retry",
      initialSignal: "poor",
    });
    navigate("/kiosk/point-10");
  };

  const launchScenarioC = () => {
    // Scenario C: NFC doctor handoff
    dispatchDemoEvent("kiosk_session_started", "point-11", "HP-11", {
      scenario: "C_nfc_handoff",
      persona: "Nigar, BDU tələbəsi",
    });
    navigate("/kiosk/point-11");
  };

  const launchScenarioD = () => {
    // Scenario D: Municipal operator command center
    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171717] font-sans p-4 sm:p-8 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DE] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Münsiflər & Prezentasiya Bələdçisi • 4 Ssenari</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            OpenCare Point 2.0 Demo Mərkəzi
          </h1>
          <p className="text-sm sm:text-base text-[#61666D] max-w-2xl">
            Münsiflər heyəti üçün layihənin bütün texnoloji qatlarını və istifadəçi səyahətlərini
            addım-addım nümayiş etdirən idarəetmə konsolu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#E8E3DE] text-xs font-bold text-[#171717] hover:border-red-400 transition shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Nümayişi Sıfırla</span>
          </button>

          <Link
            to="/kiosk"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-black hover:bg-[#8B1028] transition shadow-md"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Köşk Ekranına Keç</span>
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold animate-fadeIn">
          {actionNotice}
        </div>
      )}

      {/* Real-time Demo Ecosystem Telemetry Banner */}
      <div className="p-6 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-[#171717]">
            {metrics.totalSessions}
          </span>
          <p className="text-xs font-bold text-[#61666D]">Köşk Sessiyaları</p>
        </div>
        <div className="space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {metrics.successfulMeasurements}
          </span>
          <p className="text-xs font-bold text-[#61666D]">Uğurlu Ölçümlər</p>
        </div>
        <div className="space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-amber-600">
            {metrics.retryRatePercent}%
          </span>
          <p className="text-xs font-bold text-[#61666D]">Siqnal Təkrar Faizi</p>
        </div>
        <div className="space-y-1">
          <span className="text-2xl sm:text-3xl font-black text-[#C8102E]">
            {metrics.simulatedEmergencyRequests}
          </span>
          <p className="text-xs font-bold text-[#61666D]">Simulyasiya Təcili Sorğu</p>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: "A", title: "Ssenari A: Smartfonsuz Vətəndaş", badge: "Əsas Kiosk" },
          { id: "B", title: "Ssenari B: Siqnal Xətası & SQI", badge: "Edge AI" },
          { id: "C", title: "Ssenari C: NFC Həkim Handoff", badge: "Tele-Health" },
          { id: "D", title: "Ssenari D: Bələdiyyə İdarəetməsi", badge: "City Command" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveScenario(tab.id as "A" | "B" | "C" | "D")}
            className={`p-4 rounded-2xl text-left border transition ${
              activeScenario === tab.id
                ? "bg-[#C8102E] text-white border-red-700 shadow-md"
                : "bg-white border-[#E8E3DE] text-[#171717] hover:border-gray-400"
            }`}
          >
            <span
              className={`text-[10px] font-black uppercase tracking-wider block ${
                activeScenario === tab.id ? "text-red-200" : "text-[#C8102E]"
              }`}
            >
              {tab.badge}
            </span>
            <h3 className="font-extrabold text-sm mt-1">{tab.title}</h3>
          </button>
        ))}
      </div>

      {/* Active Scenario Card */}
      <div className="p-8 rounded-3xl bg-white border border-[#E8E3DE] shadow-md space-y-6">
        {activeScenario === "A" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-red-100 text-[#8B1028]">
                Ssenari A • 0-dan Tam Sessiya
              </span>
              <h2 className="text-2xl font-black text-[#171717]">
                Smartfonu Olmayan Vətəndaşın Xilası (Tofiq dayı, 67 yaş)
              </h2>
              <p className="text-sm text-[#61666D] leading-relaxed">
                Nərimanov Parkında gəzən 67 yaşlı təqaüdçü müəllim Tofiq dayının təzyiqi qalxır və
                halsızlaşır. Telefonu yoxdur. HP-10 köşkünə yaxınlaşır, pilləsiz pandusla sensor
                ekrana çatır, steril cihazı götürüb nəbzini ölçür (74 BPM) və bir toxunuşla 103-ə
                dəqiq köşk koordinatını göndərir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
                <span className="font-bold text-[#C8102E]">1. Əlçatan Yanaşma</span>
                <p className="text-[#61666D]">Pilləsiz pandus, 85 sm sensor ekran, yüksək kontrast.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
                <span className="font-bold text-[#C8102E]">2. Pulsuz Nəbz</span>
                <p className="text-[#61666D]">15 saniyəlik optik ölçmə, 74 döyüntü/dəqiqə, 97% SQI.</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
                <span className="font-bold text-[#C8102E]">3. Smartfonsuz SOS</span>
                <p className="text-[#61666D]">Birbaşa köşkdən GPS və stansiya kodu ilə 103 çağırışı.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={launchScenarioA}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#C8102E] text-white font-extrabold text-sm hover:bg-[#8B1028] shadow-md transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ssenari A-nı Köşkdə Başlat (HP-10)</span>
            </button>
          </div>
        )}

        {activeScenario === "B" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-amber-100 text-amber-900">
                Ssenari B • Deterministik SQI Alqoritmi
              </span>
              <h2 className="text-2xl font-black text-[#171717]">
                Küy / Hərəkət Xətası və Təkrar Ölçüm Zəmanəti
              </h2>
              <p className="text-sm text-[#61666D] leading-relaxed">
                Vətəndaş ölçmə zamanı əlini tərpədir və ya sensor zəif təmas edir. Deterministik
                Signal Quality AI alqoritmi küyü aşkar edərək 54% SQI verir və nəticəni İMTİNA edir.
                Heç bir saxta vital rəqəm göstərilmir. Sadə təlimatla cihaz yenidən taxılır və təkrar
                ölçüm 97% SQI ilə uğurla tamamlanır.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <span className="font-black">1. Küyün İmtinası (Zero False Vitals)</span>
                <p>
                  Tibbi təhlükəsizlik qaydası: Etibarsız siqnal zamanı saxta rəqəm göstərilmir.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-black">2. Bələdiyyə İzləməsi</span>
                <p>
                  Hər təkrar cəhd OpenCare City mərkəzində stansiyanın &ldquo;Retry Rate&rdquo; faizinə
                  əlavə olunur.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={launchScenarioB}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-600 text-white font-extrabold text-sm hover:bg-amber-700 shadow-md transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ssenari B-ni Köşkdə Sına (Küy Simulyasiyası)</span>
            </button>
          </div>
        )}

        {activeScenario === "C" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-blue-100 text-blue-900">
                Ssenari C • NFC Smartfon Handoff
              </span>
              <h2 className="text-2xl font-black text-[#171717]">
                Şəxsi Smartfonla Həkim Tele-Məsləhəti (Nigar, 24 yaş)
              </h2>
              <p className="text-sm text-[#61666D] leading-relaxed">
                BDU magistr tələbəsi Nigar Elmlər Akademiyası məntəqəsində (HP-11) nəbzini yoxlayır.
                Daha sonra smartfonunu köşkün NFC sahəsinə toxunduraraq növbətçi həkim Dr. Samirə
                Vəliyeva ilə səsli tele-məsləhət seansını dərhal şəxsi telefonuna köçürür.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <span className="font-black">NFC Toxunuş Simulyasiyası</span>
                <p>Web NFC və ya vizual toxunuş tətiyi ilə tele-zəng modulunun açılması.</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1">
                <span className="font-black">Canlı Səsli İnterfeys</span>
                <p>Məxfi səs dalğası, mikrofon idarəsi və simulyasiya edilmiş həkim dialoqu.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={launchScenarioC}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 text-white font-extrabold text-sm hover:bg-blue-700 shadow-md transition"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Ssenari C-ni Köşkdə Başlat (HP-11)</span>
            </button>
          </div>
        )}

        {activeScenario === "D" && (
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-emerald-100 text-emerald-900">
                Ssenari D • Bələdiyyə Dispetçer Mərkəzi
              </span>
              <h2 className="text-2xl font-black text-[#171717]">
                OpenCare City: 15 Məntəqəlik Canlı Şəhər Telemetriyası
              </h2>
              <p className="text-sm text-[#61666D] leading-relaxed">
                Bələdiyyə mühəndisi və ya 103 dispetçeri OpenCare City panelində şəhərin bütün
                məntəqələrinin statusunu, cihaz əlçatanlığını, gün ərzində baş tutan sessiyaları və
                təmir biletlərini (ticket) tək ekrandan idarə edir.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-black">Canlı Şəbəkə Xəritəsi</span>
                <p>15 stansiyanın işlək, baxışda və ya məhdud statusu.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-black">Təmir İdarəetməsi</span>
                <p>Yeni, icrada və həll edilmiş biletlərin status keçidləri.</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-black">Pilot Qiymətləndirmə</span>
                <p>SOS tapılma vaxtı, sessiya bitmə faizi və əlçatanlıq rəyləri.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={launchScenarioD}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 text-white font-extrabold text-sm hover:bg-emerald-800 shadow-md transition"
            >
              <ExternalLink className="w-4 h-4" />
              <span>OpenCare City Panelinə Keç</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Links Footer */}
      <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-[#61666D]">
        <Link to="/" className="text-[#C8102E] hover:underline">
          ← Əsas Səhifəyə qayıt
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/technology" className="hover:text-black">
            Texnologiya & SQI
          </Link>
          <Link to="/partners" className="hover:text-black">
            B2G Pilot Modeli
          </Link>
          <Link to="/map" className="hover:text-black">
            Vətəndaş Xəritəsi
          </Link>
        </div>
      </div>
    </div>
  );
}
