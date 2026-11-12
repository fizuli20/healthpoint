import { useRef } from "react";
import {
  Award,
  Download,
  Film,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function ProductVideoPage() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const realUserCast = [
    {
      name: "Tofiq Qasımov",
      age: "67 yaş",
      role: "Təqaüdçü müəllim",
      location: "Nərimanov Parkı (HP-10)",
      story:
        "Səhər gəzintisində qəfil təzyiq sıçrayışı və başgicəllənmə yaşadı. Telefon batareyası bitmişdi. OpenCarePoint HP-10 məntəqəsində pilləsiz pandus və təzyiq manşeti ilə göstəricilərini yoxladı.",
      badge: "İctimai Triage",
      avatarBg: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      name: "Nigar Əliyeva",
      age: "24 yaş",
      role: "BDU Magistr Tələbəsi",
      location: "Elmlər Akademiyası (HP-11)",
      story:
        "İmtahan həyəcanı zamanı RingXCare smart üzüyü ilə 10 saniyəyə nəbzini və SpO2-ni yoxladı. Əsas ölçüm üçün ödəniş etmədən profilinə qeyd aldı.",
      badge: "RingXCare NFC",
      avatarBg: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      name: "Rəşad Məmmədov",
      age: "38 yaş",
      role: "Gündəlik sərnişin",
      location: "28 May / Koroğlu (HP-04 & HP-09)",
      story:
        "Apar skuterindən enərkən qəfil ürək sıxıntısı keçirən vətəndaşa kömək üçün məntəqədəki 110 BPM CPR rəhbərini işə saldı və 103 xidmətinə dəqiq məkan ötürdü.",
      badge: "110 BPM CPR & AED",
      avatarBg: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      name: "Dr. Samirə Vəliyeva",
      age: "42 yaş",
      role: "Təcili Tibbi Yardım Həkimi",
      location: "103 Mərkəzi Dispetçer",
      story:
        "OpenCarePoint telemetriyasından xəstənin dəqiq GPS koordinatını və SQI ilə təsdiqlənmiş ilkin kardio göstəricilərini yoldaykən planşetində qəbul etdi.",
      badge: "B2G Telemetriya",
      avatarBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
    },
  ];

  const handleFullscreenToggle = () => {
    if (!iframeRef.current) return;
    if (!document.fullscreenElement) {
      void iframeRef.current.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FCE8EC] text-[#8B1028] text-xs font-black">
            <Film className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>{t("video.badge", "Animasiyalı Məhsul Videosu • Real Bakı İstifadəçiləri")}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            {t("video.title", "OpenCarePoint & RingXCare — Məhsul Videosu")}
          </h1>
          <p className="text-sm sm:text-base text-[#737373] max-w-3xl">
            {t(
              "video.subtitle",
              "Apar üslublu şəhər sağlamlıq məntəqələrimizin real istifadəçi həyatına təsiri: 6 dinamik səhnə, Web Audio səs dizaynı və Edge AI siqnal simulyasiyası."
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#171717] hover:border-[#C8102E] transition shadow-soft"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#C8102E]" />
            {t("video.fullscreen", "Tam Ekran")}
          </button>
          <a
            href="/downloads/OpenCarePoint.apk"
            download="OpenCarePoint.apk"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] transition shadow-brand"
          >
            <Download className="w-3.5 h-3.5" />
            {t("app.downloadApkShort", "APK Yüklə")}
          </a>
        </div>
      </div>

      {/* Embedded 16:9 Motion Player */}
      <section className="relative rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-card bg-[#0B0F19]">
        <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[520px]">
          <iframe
            ref={iframeRef}
            src="/opencarepoint_animated_product_video.html"
            title="OpenCarePoint Animated Product Video"
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
          />
        </div>
      </section>

      {/* Real-User Scenarios & Cast Breakdown */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-lg sm:text-xl font-extrabold text-[#171717] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#C8102E]" />
            {t("video.castTitle", "Həqiqi İstifadəçi Ssenariləri & Əsaslandırma")}
          </h2>
          <p className="text-xs sm:text-sm text-[#737373]">
            {t(
              "video.castSubtitle",
              "Hər bir səhnə Bakının müxtəlif yerlərində ictimai sağlamlıq və təcili yardım ehtiyacını həll edən real insan hekayəsini canlandırır."
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {realUserCast.map((user) => (
            <div
              key={user.name}
              className="bg-white rounded-3xl border border-[#E5E7EB] p-5 shadow-soft space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 h-10 rounded-2xl border flex items-center justify-center font-black text-sm ${user.avatarBg}`}
                    >
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-[#171717] text-base leading-tight">
                        {user.name}
                      </h3>
                      <p className="text-xs text-[#737373]">
                        {user.age} • {user.role}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#FFF1F2] border border-[#FCE8EC] text-[#8B1028]">
                    {user.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#171717] leading-relaxed">
                  {user.story}
                </p>
              </div>

              <div className="pt-2 border-t border-[#F5F5F5] flex items-center justify-between text-xs text-[#737373]">
                <span className="font-semibold text-[#8B1028] flex items-center gap-1">
                  📍 {user.location}
                </span>
                <Link
                  to="/"
                  className="font-bold text-[#C8102E] hover:underline inline-flex items-center gap-1"
                >
                  Xəritədə bax →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Structured Video Scenes Summary */}
      <section className="bg-[#FAFAFA] rounded-3xl border border-[#E5E7EB] p-6 space-y-4">
        <h3 className="text-base font-extrabold text-[#171717] flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#C8102E]" />
          {t("video.timelineTitle", "Video Xronometrajı & Struktur (6 Səhnə)")}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:00 – 00:15 • Səhnə 1</span>
            <p className="font-bold text-[#171717]">Problem: Şəhərdə qəfil narahatlıq</p>
            <p className="text-[#737373]">Tofiq dayının parkda halı pisləşir; klinikalar uzaqdır.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:15 – 00:30 • Səhnə 2</span>
            <p className="font-bold text-[#171717]">Həll: OpenCarePoint HP-10 Kiosku</p>
            <p className="text-[#737373]">Apar üslubunda pilləsiz pandus və sensor paneli.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:30 – 00:45 • Səhnə 3</span>
            <p className="font-bold text-[#171717]">RingXCare: Ağıllı Üzük & NFC</p>
            <p className="text-[#737373]">Nigar tələbə toxunuşla dərhal ölçüm seansını başladır.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:45 – 01:00 • Səhnə 4</span>
            <p className="font-bold text-[#171717]">Edge AI: SQI 97% PPG Təhlili</p>
            <p className="text-[#737373]">Hərəkət xətasını aradan qaldıran lokal mikro-model.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">01:00 – 01:15 • Səhnə 5</span>
            <p className="font-bold text-[#171717]">Təcili Reaksiya: 110 BPM & SOS 103</p>
            <p className="text-[#737373]">Dəqiq koordinat 103 briqadasına ötürülür; CPR bələdçisi.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">01:15 – 01:30 • Səhnə 6</span>
            <p className="font-bold text-[#171717]">15 Məntəqəlik Ağıllı Bakı Şəbəkəsi</p>
            <p className="text-[#737373]">B2G şəhər modeli və hər kəs üçün pulsuz ilkin səhiyyə.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
