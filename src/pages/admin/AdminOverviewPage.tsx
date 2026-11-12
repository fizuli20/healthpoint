import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Heart,
  MapPin,
  PhoneCall,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  useLocalizedAccessPointsQuery,
} from "../../hooks/useHealthPointData";
import { getKioskCode } from "../../lib/localizePoint";
import {
  calculateDemoMetrics,
  subscribeDemoEvents,
  type DemoMetricsSummary,
} from "../../services/demoEventStore";

export function AdminOverviewPage() {
  const { t } = useTranslation();
  const { data: points = [] } = useLocalizedAccessPointsQuery();
  const [metrics, setMetrics] = useState<DemoMetricsSummary>(calculateDemoMetrics());

  // Listen to live demo event bus
  useEffect(() => {
    const unsubscribe = subscribeDemoEvents(() => {
      setMetrics(calculateDemoMetrics());
    });
    return () => unsubscribe();
  }, []);

  const operationalCount = points.filter((p) => p.operationalStatus === "operational").length;

  const kpis = [
    {
      label: t("admin.totalPoints"),
      value: points.length || 15,
      sub: "Bakı Pilot Şəbəkəsi",
      icon: MapPin,
      accent: "text-[#C8102E]",
      bg: "bg-red-50",
    },
    {
      label: t("admin.operationalPoints"),
      value: operationalCount || 12,
      sub: "Tam İşlək Vəziyyətdə",
      icon: CheckCircle2,
      accent: "text-emerald-700",
      bg: "bg-emerald-50",
    },
    {
      label: "Köşk Sessiyaları",
      value: metrics.totalSessions,
      sub: "Real-vaxt Hadisə Şini",
      icon: Activity,
      accent: "text-blue-700",
      bg: "bg-blue-50",
    },
    {
      label: "Uğurlu Ölçümlər",
      value: metrics.successfulMeasurements,
      sub: `${metrics.completionRatePercent}% Tamamlama`,
      icon: Heart,
      accent: "text-[#C8102E]",
      bg: "bg-red-50",
    },
    {
      label: "Siqnal Təkrarı",
      value: `${metrics.retryRatePercent}%`,
      sub: `${metrics.rejectedRetries} Küy İmtinası`,
      icon: RefreshCw,
      accent: "text-amber-700",
      bg: "bg-amber-50",
    },
    {
      label: "Simulyasiya SOS",
      value: metrics.simulatedEmergencyRequests,
      sub: "103 Koordinat Göndərişi",
      icon: PhoneCall,
      accent: "text-rose-700",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Real-time KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-[#E8E3DE] shadow-soft p-4 space-y-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-[#61666D]">{kpi.label}</span>
                <div className={`w-7 h-7 rounded-lg ${kpi.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${kpi.accent}`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-black text-[#171717]">{kpi.value}</p>
                <p className="text-[10px] font-semibold text-[#61666D] truncate">{kpi.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Telemetry Event Stream & Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Telemetry Stream */}
        <section className="lg:col-span-2 bg-white rounded-3xl border border-[#E8E3DE] shadow-soft p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-extrabold text-[#171717]">
                Canlı Köşk Hadisələri & Telemetriya (Real-vaxt Şini)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#61666D]">
              BroadcastChannel: AKTİV
            </span>
          </div>

          <p className="text-xs text-[#61666D]">
            İstənilən köşk pəncərəsində edilən ölçüm, küy imtinası, NFC toxunuşu və ya təcili çağırış
            dərhal bu axına daxil olur.
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {metrics.recentEvents.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Hadisə yoxdur.</p>
            ) : (
              metrics.recentEvents.map((evt) => {
                const timeStr = new Date(evt.timestamp).toLocaleTimeString("az-AZ", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });
                return (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      {evt.type === "kiosk_session_started" && (
                        <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      {evt.type === "measurement_quality_accepted" && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      )}
                      {evt.type === "measurement_quality_rejected" && (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      {evt.type === "emergency_request_simulated" && (
                        <PhoneCall className="w-4 h-4 text-[#C8102E] shrink-0" />
                      )}
                      {evt.type === "doctor_handoff_simulated" && (
                        <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                      )}
                      {evt.type === "session_completed" && (
                        <CheckCircle2 className="w-4 h-4 text-gray-500 shrink-0" />
                      )}

                      <div>
                        <span className="font-bold text-[#171717]">
                          {evt.stationCode || "HP-10"}:{" "}
                        </span>
                        <span className="text-[#61666D]">
                          {evt.type === "kiosk_session_started" && "Yeni köşk sessiyası başladı"}
                          {evt.type === "measurement_quality_accepted" &&
                            "Nəbz ölçümü uğurla qəbul edildi (SQI 97%)"}
                          {evt.type === "measurement_quality_rejected" &&
                            "Siqnal küyü aşkar edildi — təkrar tələb olundu"}
                          {evt.type === "emergency_request_simulated" &&
                            "Təcili yardım sorğusu göndərildi (Simulyasiya)"}
                          {evt.type === "doctor_handoff_simulated" &&
                            "NFC ilə həkim handoff-u aktivləşdi"}
                          {evt.type === "session_completed" && "Sessiya tamamlandı və sıfırlandı"}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] text-gray-400 shrink-0">{timeStr}</span>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right 1 Col: Quick Station Actions */}
        <section className="bg-white rounded-3xl border border-[#E8E3DE] shadow-soft p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h2 className="text-base font-extrabold text-[#171717]">Məntəqə Şəbəkəsi</h2>
            <div className="space-y-2">
              {points.slice(0, 5).map((pt) => (
                <div
                  key={pt.id}
                  className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-[#171717]">{pt.name}</p>
                    <p className="text-[10px] text-[#61666D]">{pt.code || getKioskCode(pt.id)}</p>
                  </div>
                  <Link
                    to={`/kiosk/${pt.id}`}
                    target="_blank"
                    className="text-[11px] font-bold text-[#C8102E] hover:underline"
                  >
                    Aç →
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/admin/points"
            className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-center text-[#171717] hover:bg-gray-50 block"
          >
            Bütün Məntəqələri İdarə Et (15) →
          </Link>
        </section>
      </div>

      {/* Pilot Planning & Validation Criteria (Section 12) */}
      <section className="bg-white rounded-3xl border border-[#E8E3DE] shadow-soft p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase text-[#C8102E]">
              Bələdiyyə Metrikası
            </span>
            <h2 className="text-xl font-black text-[#171717]">
              Pilot Qiymətləndirmə Meyarları & KPI Hədəfləri
            </h2>
            <p className="text-xs text-[#61666D]">
              Nərimanov Parkı pilotunun uğurunu təyin edən 5 əsas əməliyyat indikatoru.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-50 text-blue-800 border border-blue-200">
            Faza 2 Pilot Standartı
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
            <span className="font-black text-[#C8102E]">SOS Tapılma Vaxtı</span>
            <div className="text-xl font-black text-[#171717]">&lt; 5 saniyə</div>
            <p className="text-[11px] text-[#61666D]">Vətəndaşın təcili düyməni tapma müddəti.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
            <span className="font-black text-emerald-700">Dəstəksiz Tamamlama</span>
            <div className="text-xl font-black text-[#171717]">&gt; 92%</div>
            <p className="text-[11px] text-[#61666D]">Kənardan kömək olmadan sessiyanı bitirmə.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
            <span className="font-black text-amber-700">Siqnal Təkrar Həddi</span>
            <div className="text-xl font-black text-[#171717]">&lt; 15%</div>
            <p className="text-[11px] text-[#61666D]">Sensor küyü səbəbindən təkrar ölçüm nisbəti.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
            <span className="font-black text-blue-700">Tərk Etmə Nisbəti</span>
            <div className="text-xl font-black text-[#171717]">&lt; 8%</div>
            <p className="text-[11px] text-[#61666D]">Yarıda dayandırılan ölçüm seansları.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E3DE] space-y-1">
            <span className="font-black text-purple-700">Əlçatanlıq Rəyi</span>
            <div className="text-xl font-black text-[#171717]">100%</div>
            <p className="text-[11px] text-[#61666D]">Təkərli araba və görmə zəifliyi uyğunluğu.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
