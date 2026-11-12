import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Layers,
  Send,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

export function PartnersPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    organization: "",
    orgType: "municipality",
    email: "",
    phone: "",
    locationTarget: "Baku Metro",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#171717] font-sans p-4 sm:p-8 space-y-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E3DE] pb-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-black">
            <Building2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>B2G & B2B Şəhər Tərəfdaşlığı Modeli</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171717] tracking-tight">
            Şəhər İnfrastrukturu & Pilot Əməkdaşlıq
          </h1>
          <p className="text-sm sm:text-base text-[#61666D] max-w-2xl">
            Bələdiyyələr, ictimai nəqliyyat operatorları və iri biznes mərkəzləri üçün davamlı
            sağlamlıq infrastruktur paketləri.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/kiosk"
            className="px-4 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-black hover:bg-[#8B1028] transition shadow-md"
          >
            Köşk İnterfeysinə Keç →
          </Link>
        </div>
      </div>

      {/* Business Model Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#171717] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#C8102E]" />
          <span>Gəlir Modeli & Maliyyələşmə Mənbələri</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-[#C8102E] font-black">
              B2G
            </div>
            <h3 className="font-extrabold text-lg text-[#171717]">Bələdiyyə İnfrastrukturu</h3>
            <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
              Şəhər icra hakimiyyətləri və bələdiyyələr üçün park, meydan və bulvarlarda köşk
              quraşdırma və abunə təmir paketləri.
            </p>
            <ul className="text-xs font-semibold text-[#171717] space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Quraşdırma və hardware təminatı
              </li>
              <li className="flex items-center gap-1.5 text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Aylıq sterilizasiya və texniki baxış
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-black">
              B2B
            </div>
            <h3 className="font-extrabold text-lg text-[#171717]">Nəqliyyat & İctimai Məkanlar</h3>
            <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
              Bakı Metropoliteni, Dəmir Yolu stansiyaları, hava limanı və ticarət mərkəzləri (Mall)
              üçün korporativ sağlamlıq məntəqələri.
            </p>
            <ul className="text-xs font-semibold text-[#171717] space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5 text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Korporativ ESG və sosial məsuliyyət
              </li>
              <li className="flex items-center gap-1.5 text-blue-700">
                <CheckCircle2 className="w-3.5 h-3.5" /> Sərnişin təhlükəsizliyi və ilk yardım
              </li>
            </ul>
          </div>

          <div className="p-7 rounded-3xl bg-white border border-[#E8E3DE] shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 font-black">
              FREE
            </div>
            <h3 className="font-extrabold text-lg text-[#171717]">Vətəndaş Girişi: Pulsuz</h3>
            <p className="text-xs sm:text-sm text-[#61666D] leading-relaxed">
              Vətəndaş üçün əsas nəbz ölçümü və təcili yardım çağırışı 100% ödənişsizdir. Könüllü əlavə
              həkim konsultasiyası üçün 1-2 AZN hipotezi sınaqdan keçirilir.
            </p>
            <ul className="text-xs font-semibold text-[#171717] space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> Əsas nəbz və SOS: Pulsuz
              </li>
              <li className="flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" /> İctimai rifah və bərabər çıxış
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4-Phase Proposed Pilot Roadmap */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-[#171717] flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#C8102E]" />
          <span>Təklif Olunan 4 Mərhələli Pilot Yol Xəritəsi</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="px-2 py-0.5 rounded font-black text-[#C8102E] bg-red-100">
              Faza 1 • Sınaq
            </span>
            <h4 className="font-extrabold text-sm text-[#171717]">Laboratoriya & Əlçatanlıq</h4>
            <p className="text-[#61666D]">
              Fiziki köşkün erqonomika sınaqları, təkərli araba yanaşması və sensorlu ekran
              interfeysinin WCAG auditi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="px-2 py-0.5 rounded font-black text-amber-900 bg-amber-100">
              Faza 2 • Nərimanov
            </span>
            <h4 className="font-extrabold text-sm text-[#171717]">Nərimanov Parkı Pilotu</h4>
            <p className="text-[#61666D]">
              3 ədəd canlı sınaq köşkünün park zonalarında quraşdırılması və real istifadəçi rəylərinin
              toplanması.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="px-2 py-0.5 rounded font-black text-blue-900 bg-blue-100">
              Faza 3 • 103 İnteqrasiyası
            </span>
            <h4 className="font-extrabold text-sm text-[#171717]">TƏBİB & 103 Telemetriyası</h4>
            <p className="text-[#61666D]">
              Təcili Tibbi Yardım dispetçer sistemi ilə rəsmi API körpüsü və real-vaxt koordinat
              ötürülməsi.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#E8E3DE] space-y-2 shadow-sm">
            <span className="px-2 py-0.5 rounded font-black text-emerald-900 bg-emerald-100">
              Faza 4 • Genişlənmə
            </span>
            <h4 className="font-extrabold text-sm text-[#171717]">Bakı Üzrə 15 Məntəqə</h4>
            <p className="text-[#61666D]">
              Metro stansiyaları, Koroğlu nəqliyyat qovşağı və universitet şəhərciklərini əhatə edən
              vahid şəhər şəbəkəsi.
            </p>
          </div>
        </div>
      </section>

      {/* Partner Inquiry Form */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E8E3DE] shadow-md space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-black uppercase text-[#C8102E]">
            Əməkdaşlıq Müraciəti
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#171717]">
            Pilot Layihəyə Qoşulun
          </h2>
          <p className="text-xs sm:text-sm text-[#61666D]">
            Bələdiyyənizdə və ya ictimai məkanınızda OpenCare Point köşkünün quraşdırılması üçün
            ilkin sorğu göndərin.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-black text-lg">Müraciətiniz Nümayiş Bazasında Qeydə Alındı!</h3>
            <p className="text-xs">
              ⚠️ Qeyd: Bu hakaton prototipidir. Məlumatlar lokal demo yaddaşında saxlanıldı və xarici
              serverə göndərilmədi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#171717]">Ad, Soyad</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Məs: Fərid Məmmədov"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717]">Qurum / Təşkilat</label>
                <input
                  type="text"
                  required
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Məs: Nərimanov Bələdiyyəsi / Bakı Metropoliteni"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="font-bold text-[#171717]">Təşkilat Növü</label>
                <select
                  value={formData.orgType}
                  onChange={(e) => setFormData({ ...formData, orgType: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                >
                  <option value="municipality">Bələdiyyə / İcra Hakimiyyəti</option>
                  <option value="transit">İctimai Nəqliyyat Operatoru</option>
                  <option value="commercial">Ticarət Mərkəzi / Mall</option>
                  <option value="university">Universitet Kampusu</option>
                  <option value="other">Digər</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717]">E-poçt</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="ad@qurum.gov.az"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#171717]">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+994 50 123 45 67"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-[#171717]">Qeydlər və Tələblər</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Təklif olunan yerləşmə məkanı, təxmini köşk sayı və s."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-[#61666D]">
                ⚠️ Qeyd: Bu forma prototip məqsədlidir. Məlumatlar yerli nümayiş bazasında qeyd
                edilir.
              </p>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#C8102E] text-white font-extrabold hover:bg-[#8B1028] shadow-md transition flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Sorğunu Göndər</span>
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Footer Nav */}
      <div className="pt-4 flex items-center justify-between text-xs font-bold text-[#61666D]">
        <Link to="/" className="text-[#C8102E] hover:underline">
          ← Əsas Səhifəyə qayıt
        </Link>
        <Link to="/map" className="hover:text-black">
          Vətəndaş Xəritəsinə Keç →
        </Link>
      </div>
    </div>
  );
}
