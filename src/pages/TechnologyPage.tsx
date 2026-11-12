import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  CAPABILITY_REGISTRY,
  getStatusBadgeClass,
} from "../lib/capabilityRegistry";

export function TechnologyPage() {
  const [waveformMode, setWaveformMode] = useState<"clean" | "noisy">("clean");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated comparison waveform on Canvas
  useEffect(() => {
    let animId: number;
    let t = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    const render = () => {
      t += 0.04;
      ctx.fillStyle = "#0A0E1A";
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = waveformMode === "clean" ? "#10B981" : "#F59E0B";

      const cy = h / 2;
      for (let x = 0; x < w; x++) {
        const phi = (x * 0.04 - t * 3.5) % (Math.PI * 2);
        // PPG systolic wave + dicrotic notch
        let wave =
          Math.exp(-Math.pow(phi - 1.4, 2) / 0.16) * 42 +
          Math.exp(-Math.pow(phi - 2.7, 2) / 0.28) * 16 -
          10;

        if (waveformMode === "noisy") {
          // Add motion noise & baseline drift
          wave += Math.sin(x * 0.09 + t * 4) * 20 + Math.cos(x * 0.22 + t * 7) * 14;
        }

        const y = cy - wave;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animId);
  }, [waveformMode]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171717] font-sans p-4 sm:p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DE] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-200 text-xs font-black">
            <Cpu className="w-3.5 h-3.5 text-blue-600" />
            <span>Aparat, Siqnal AI & Şəbəkə Arxitekturası</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Texnoloji Arxitektura & SQI Analizi
          </h1>
          <p className="text-sm sm:text-base text-[#61666D] max-w-2xl">
            Sintetik optik PPG siqnallarının deterministik təhlili, sensor keyfiyyət süzgəci və şəhər
            telemetriya protokolu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/kiosk"
            className="px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-black hover:bg-[#8B1028] transition shadow-md"
          >
            Köşkdə Sına →
          </Link>
        </div>
      </div>

      {/* 5-Step System Architecture Sequence */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#171717] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#C8102E]" />
          <span>Sistem Məlumat Axını (5 Mərhələ)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="font-mono text-[#C8102E] font-black">01 • Sensor</span>
            <h3 className="font-extrabold text-[#171717]">Optik Fotopletizmoqrafiya</h3>
            <p className="text-[#61666D]">
              Yaşıl/Qırmızı LED və fotodiod vasitəsilə periferik arterial pulsasiyanın qeydə alınması.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="font-mono text-[#C8102E] font-black">02 • Transfer</span>
            <h3 className="font-extrabold text-[#171717]">BLE Simsiz Əlaqə</h3>
            <p className="text-[#61666D]">
              Köşkün BLE GATT qovşağına saniyədə 50 Hz tezliklə xam siqnal paketlərinin ötürülməsi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="font-mono text-[#C8102E] font-black">03 • Edge AI</span>
            <h3 className="font-extrabold text-[#171717]">SQI Keyfiyyət Süzgəci</h3>
            <p className="text-[#61666D]">
              Deterministik alqoritm hərəkət küyünü, zirvə ritmini və siqnal-küy nisbətini (SNR) yoxlayır.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="font-mono text-[#C8102E] font-black">04 • Köşk Ekranı</span>
            <h3 className="font-extrabold text-[#171717]">Şəffaf Nümayiş</h3>
            <p className="text-[#61666D]">
              Nəticə qəbul edilərsə BPM göstərilir. Küy olduqda saxta nəticə imtina edilir və təkrar tələb olunur.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="font-mono text-[#C8102E] font-black">05 • Dəstək</span>
            <h3 className="font-extrabold text-[#171717]">103 / Həkim Seçimi</h3>
            <p className="text-[#61666D]">
              Smartfonsuz 103 koordinat ötürülməsi və ya NFC vasitəsilə səsli tele-məsləhət handoff-u.
            </p>
          </div>
        </div>
      </section>

      {/* Live Interactive Waveform Comparison */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DE] shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-[#C8102E]">
              İnteraktiv Simulyator
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#171717]">
              Deterministik PPG Dalğası & SQI Müqayisəsi
            </h2>
            <p className="text-xs text-[#61666D]">
              Təmiz siqnal ilə hərəkət küyü arasındakı fərqi və alqoritmin reaksiyasını real-vaxtda
              müşahidə edin.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl bg-gray-100 p-1 border border-gray-200">
            <button
              type="button"
              onClick={() => setWaveformMode("clean")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                waveformMode === "clean"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              ✓ Təmiz Dalğa (97% SQI)
            </button>
            <button
              type="button"
              onClick={() => setWaveformMode("noisy")}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition ${
                waveformMode === "noisy"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              ⚠ Hərəkət Küyü (54% SQI)
            </button>
          </div>
        </div>

        {/* Canvas Display */}
        <div className="rounded-2xl overflow-hidden border-2 border-gray-800 shadow-xl bg-[#0A0E1A]">
          <canvas
            ref={canvasRef}
            width={800}
            height={240}
            className="w-full h-[200px] sm:h-[240px] block"
          />
        </div>

        {/* Live Evaluation Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-bold text-[#61666D]">Hesablanmış SQI:</span>
            <div className="text-2xl font-black">
              {waveformMode === "clean" ? (
                <span className="text-emerald-600">97% (Əla)</span>
              ) : (
                <span className="text-amber-600">54% (Qeyri-kafi)</span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-bold text-[#61666D]">Alqoritm Qərarı:</span>
            <div className="text-base font-extrabold">
              {waveformMode === "clean" ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Ölçmə Qəbul Edildi (74 BPM)
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> İmtina (0 Saxta Vital)
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
            <span className="font-bold text-[#61666D]">İstifadəçiyə Mesaj:</span>
            <p className="text-[#61666D]">
              {waveformMode === "clean"
                ? "Nəticə ekranda nümayiş olundu və seans qeydə alındı."
                : "Ölçmə tamamlanmadı. Cihazı yenidən yerləşdirib əlinizi sabit saxlayın."}
            </p>
          </div>
        </div>
      </section>

      {/* Transparent Capability Registry Matrix */}
      <section className="space-y-4">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-[#C8102E]">
            Şəffaf Reyestr
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717]">
            Funksionallıq & İnteqrasiya Matrisi
          </h2>
          <p className="text-xs sm:text-sm text-[#61666D]">
            Hakaton tələblərinə uyğun olaraq nəyin proqramda icra edildiyi, nəyin simulyasiya
            olunduğu və nəyin gələcək aparat üçün planlaşdırıldığı açıq şəkildə bəyan edilir.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#E8E3DE] shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {Object.values(CAPABILITY_REGISTRY).map((cap) => (
              <div
                key={cap.id}
                className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#171717]">
                      {cap.name}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${getStatusBadgeClass(
                        cap.status
                      )}`}
                    >
                      {cap.badgeAz}
                    </span>
                  </div>
                  <p className="text-xs text-[#61666D] leading-relaxed">{cap.descriptionAz}</p>
                </div>

                <div className="text-left sm:text-right text-[11px] font-mono text-[#61666D] shrink-0">
                  <p className="font-bold text-[#171717]">Texniki detal:</p>
                  <p>{cap.technicalDetailsAz}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Nav */}
      <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#61666D]">
        <Link to="/" className="text-[#C8102E] hover:underline">
          ← Əsas Səhifəyə qayıt
        </Link>
        <Link to="/partners" className="hover:text-black">
          B2G Pilot & Tərəfdaşlıq Modeli →
        </Link>
      </div>
    </div>
  );
}
