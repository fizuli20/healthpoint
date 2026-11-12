import { useRef, useState } from "react";
import {
  AlertTriangle,
  Clock,
  Download,
  FileText,
  Film,
  Maximize2,
  Monitor,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function ProductVideoPage() {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [showTranscript, setShowTranscript] = useState(false);

  // Illustrative Persona Cast (Explicitly labeled as concept scenarios, not real persons)
  const illustrativeCast = [
    {
      name: "Tofiq Qasımov",
      age: "67 yaş",
      role: "Təqaüdçü müəllim",
      location: "Nərimanov Parkı (HP-10)",
      story:
        "Səhər gəzintisində qəfil təzyiq sıçrayışı və başgicəllənmə yaşadı. Telefon batareyası bitmişdi. OpenCare Point HP-10 köşkündə pilləsiz pandus və ölçmə cihazı ilə göstəricilərini yoxladı.",
      badge: "İllüstrativ Ssenari",
      avatarBg: "bg-amber-100 text-amber-800 border-amber-300",
    },
    {
      name: "Nigar Əliyeva",
      age: "24 yaş",
      role: "BDU Magistr Tələbəsi",
      location: "Elmlər Akademiyası (HP-11)",
      story:
        "İmtahan həyəcanı zamanı köşkdəki ölçmə cihazı ilə 15 saniyəyə nəbzini yoxladı və NFC ilə smartfona həkim məsləhəti keçidi aldı.",
      badge: "İllüstrativ Ssenari",
      avatarBg: "bg-purple-100 text-purple-800 border-purple-300",
    },
    {
      name: "Rəşad Məmmədov",
      age: "38 yaş",
      role: "Gündəlik sərnişin",
      location: "28 May / Koroğlu (HP-04 & HP-09)",
      story:
        "Nəqliyyat qovşağında qəfil ürək sıxıntısı keçirən vətəndaşa kömək üçün köşkün 110 BPM CPR rəhbərini işə saldı və 103 xidmətinə dəqiq məkan ötürdü.",
      badge: "İllüstrativ Ssenari",
      avatarBg: "bg-blue-100 text-blue-800 border-blue-300",
    },
    {
      name: "Dr. Samirə Vəliyeva",
      age: "42 yaş",
      role: "Təcili Tibbi Yardım Həkimi",
      location: "103 Mərkəzi Dispetçer",
      story:
        "OpenCare Point telemetriyasından xəstənin dəqiq GPS koordinatını və SQI ilə təsdiqlənmiş ilkin kardio göstəricilərini yoldaykən planşetində qəbul etdi.",
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
            <span>Məhsul Videosu • 60 FPS HTML5 Canvas Hərəkət Qrafikası</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171717]">
            OpenCare Point — Məhsul Videosu & Ssenarilər
          </h1>
          <p className="text-sm sm:text-base text-[#737373] max-w-3xl">
            Bakı şəhər sağlamlıq köşklərinin vətəndaş həyatına təsiri: 6 dinamik səhnə, Web Audio
            prosedural səs dizaynı və real-vaxt siqnal keyfiyyəti simulyasiyası.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleFullscreenToggle}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#171717] hover:border-[#C8102E] transition shadow-soft"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Tam Ekran</span>
          </button>

          <Link
            to="/kiosk"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#E5E7EB] text-xs font-bold text-[#171717] hover:border-[#C8102E] transition shadow-soft"
          >
            <Monitor className="w-3.5 h-3.5 text-[#C8102E]" />
            <span>Köşk İnterfeysi</span>
          </Link>

          <a
            href="/downloads/OpenCarePoint.apk"
            download="OpenCarePoint.apk"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-[#8B1028] transition shadow-brand"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t("app.downloadApkShort", "APK Yüklə")}</span>
          </a>
        </div>
      </div>

      {/* Mandatory Scenario Transparency Notice */}
      <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>İllüstrativ Ssenari Xəbərdarlığı:</strong> Aşağıdakı video və personajlar
          OpenCare Point konseptini nümayiş etdirmək üçün hazırlanmış illüstrasiyalardır. Təcili
          tibbi yardımın gəlişi montaj kəsimi (&ldquo;Bir qədər sonra&rdquo;) ilə göstərilir və 20 saniyə
          ərzində gəliş iddia edilmir.
        </span>
      </div>

      {/* Embedded 16:9 60 FPS HTML5 Canvas Motion Player */}
      <section className="relative rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-card bg-[#0B0F19]">
        <div className="relative w-full aspect-[16/9] min-h-[380px] sm:min-h-[520px]">
          <iframe
            ref={iframeRef}
            src="/opencarepoint_animated_product_video.html"
            title="OpenCare Point 60 FPS Animasiyalı Məhsul Videosu"
            className="w-full h-full border-0 block"
            allow="autoplay; fullscreen"
          />
        </div>
      </section>

      {/* Transcript & Timing Breakdown Accordion */}
      <section className="bg-white rounded-3xl border border-[#E5E7EB] p-6 space-y-4 shadow-soft">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C8102E]" />
            <h3 className="text-base font-extrabold text-[#171717]">
              Əsas Hekayə Xətti & Mətn Transkripti (20 saniyə)
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs font-bold text-[#C8102E] hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{showTranscript ? "Bağla" : "Transkripti oxu"}</span>
          </button>
        </div>

        {showTranscript && (
          <div className="space-y-3 pt-2 text-xs text-[#61666D] border-t border-gray-100 animate-fadeIn">
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#C8102E]">00:00 – 00:04 • Qəfil Narahatlıq</span>
              <p>Bakı küçəsində gəzən yaşlı vətəndaş qəfil başgicəllənmə və halsızlıq hiss edir.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#C8102E]">00:04 – 00:07 • Köşkün Tapılması</span>
              <p>Yaxınlıqdakı OpenCare Point köşkünü və pilləsiz əlçatan pandusunu görür.</p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#C8102E]">00:07 – 00:12 • Nəbz Ölçümü</span>
              <p>
                Köşkdəki steril ölçmə cihazından istifadə edərək 15 saniyəyə nəbzini (74 BPM) böyük
                ekranda oxuyur.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#C8102E]">00:12 – 00:16 • Smartfonsuz SOS</span>
              <p>
                Narahatlıq davam etdiyindən ekrandakı qırmızı təcili yardım düyməsinə toxunaraq köşkün
                GPS koordinatlarını 103 dispetçerinə göndərir.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
              <span className="font-bold text-[#C8102E]">
                00:16 – 00:20 • (Bir qədər sonra) Tibbi Briqada
              </span>
              <p>
                Dispetçer təsdiqindən sonra təcili tibbi yardım briqadası məntəqəyə çatır və vətəndaşa
                kömək edir.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Illustrative Scenarios Grid */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-[#C8102E]">
            İllüstrativ Ssenarilər
          </span>
          <h3 className="text-lg font-extrabold text-[#171717]">
            Fərqli Vətəndaş Ehtiyacları & Şəhər Konteksti
          </h3>
          <p className="text-xs text-[#737373]">
            Hər kəs üçün bərabər və maneəsiz ilkin səhiyyə çıxışı modelləri.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {illustrativeCast.map((user) => (
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
                      <h4 className="font-extrabold text-[#171717] text-base leading-tight">
                        {user.name}
                      </h4>
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
                  to="/map"
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
          <span>Video Xronometrajı & Struktur (6 Səhnə)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:00 – 00:15 • Səhnə 1</span>
            <p className="font-bold text-[#171717]">Problem: Şəhərdə qəfil narahatlıq</p>
            <p className="text-[#737373]">Tofiq dayının parkda halı pisləşir; klinikalar uzaqdır.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:15 – 00:30 • Səhnə 2</span>
            <p className="font-bold text-[#171717]">Həll: OpenCare Point HP-10 Kiosku</p>
            <p className="text-[#737373]">Pilləsiz pandus və steril ölçmə cihazı yuvası.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E8E3DE] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:30 – 00:45 • Səhnə 3</span>
            <p className="font-bold text-[#171717]">NFC Handoff: Smartfon Toxunuşu</p>
            <p className="text-[#737373]">Nigar tələbə toxunuşla həkim zəngini telefonuna köçürür.</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-[#E5E7EB] space-y-1">
            <span className="font-extrabold text-[#C8102E]">00:45 – 01:00 • Səhnə 4</span>
            <p className="font-bold text-[#171717]">Edge AI: SQI 97% PPG Təhlili</p>
            <p className="text-[#737373]">Hərəkət xətasını aradan qaldıran deterministik süzgəc.</p>
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
