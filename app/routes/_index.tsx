import { Link } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { Navbar } from "~/components/layout/navbar";
import {
  FileText,
  ClipboardList,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  Zap,
  Shield,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  FileText,
  ClipboardList,
  MessageSquare,
  CheckCircle2,
  Zap,
  Shield,
};

export default function LandingPage() {
  const { config, loading } = useConfigurables();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1B2D5B] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const heroHeading = config.heroHeading ?? "CV Sempurna untuk Pekerjaan Impianmu";
  const heroSubheading =
    config.heroSubheading ??
    "Unggah CV-mu, tempel deskripsi pekerjaan, dan dapatkan CV yang disesuaikan, rencana persiapan wawancara, serta sesi latihan mock interview — semuanya dalam hitungan menit.";
  const heroCta = config.heroCta ?? "Mulai Sekarang";
  const featuresSection = config.featuresSection ?? {
    title: "Semua yang Kamu Butuhkan",
    items: [
      {
        title: "CV yang Disesuaikan",
        description:
          "AI kami menulis ulang dan menyesuaikan CV-mu agar cocok dengan kata kunci dan persyaratan pekerjaan yang ditargetkan.",
        icon: "FileText",
      },
      {
        title: "Rencana Persiapan Wawancara",
        description:
          "Dapatkan peta jalan persiapan yang terstruktur — topik kunci, kategori pertanyaan, dan jadwal belajar.",
        icon: "ClipboardList",
      },
      {
        title: "Mock Interview Interaktif",
        description:
          "Latih wawancara dengan AI interviewer dan dapatkan feedback langsung atas setiap jawabanmu.",
        icon: "MessageSquare",
      },
    ],
  };
  const stepsSection = config.stepsSection ?? {
    title: "Cara Kerja CVTailor",
    steps: [
      {
        number: "1",
        title: "Unggah CV",
        description: "Upload CV-mu dalam format PDF atau tempel teks langsung.",
      },
      {
        number: "2",
        title: "Masukkan Info Pekerjaan",
        description: "Tempel deskripsi lengkap pekerjaan yang kamu lamar.",
      },
      {
        number: "3",
        title: "Dapatkan Hasilnya",
        description: "CV yang disesuaikan, rencana persiapan, dan sesi latihan siap untukmu.",
      },
    ],
  };
  const footerText = config.footerText ?? "© 2026 CVTailor. Semua hak dilindungi.";

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1B2D5B]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-[#2ECC71] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-[#2ECC71] text-sm font-medium mb-6 border border-white/20">
              <Zap className="w-3.5 h-3.5" />
              AI-Powered CV Tailoring
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {heroHeading}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
              {heroSubheading}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#2ECC71] text-white font-semibold text-base hover:bg-green-400 transition-all shadow-lg shadow-green-900/30 hover:shadow-xl hover:scale-105"
              >
                {heroCta}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/auth/login"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-base hover:bg-white/20 transition-all border border-white/20"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 0C1200 40 720 60 0 0L0 60Z" fill="#F8F9FA" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D5B] mb-4">
              {featuresSection.title}
            </h2>
            <p className="text-[#6B7280] text-lg max-w-xl mx-auto">
              Tiga output cerdas dari satu input pekerjaan
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuresSection.items?.map((feature, index) => {
              const Icon = ICON_MAP[feature.icon ?? "FileText"] ?? FileText;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E7EB] hover:shadow-md hover:border-[#2ECC71]/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1B2D5B]/10 flex items-center justify-center mb-5 group-hover:bg-[#2ECC71]/10 transition-colors">
                    <Icon className="w-6 h-6 text-[#1B2D5B] group-hover:text-[#2ECC71] transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#1B2D5B] mb-3">{feature.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1B2D5B] mb-4">
              {stepsSection.title}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-[#E5E7EB]" />
            {stepsSection.steps?.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center relative">
                <div className="w-24 h-24 rounded-full bg-[#1B2D5B] flex items-center justify-center mb-6 shadow-lg z-10 relative">
                  <span className="text-3xl font-bold text-white">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold text-[#1B2D5B] mb-3">{step.title}</h3>
                {step.description && (
                  <p className="text-[#6B7280] leading-relaxed max-w-xs">{step.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-r from-[#1B2D5B] to-[#243d7a]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Dapat Pekerjaan Impianmu?
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
            Bergabunglah dengan ribuan pencari kerja yang sudah menggunakan CVTailor untuk meningkatkan peluang mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#2ECC71] text-white font-semibold text-base hover:bg-green-400 transition-all shadow-lg"
            >
              Mulai Gratis Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-1.5 text-blue-200 text-sm">
              <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
              Gratis untuk memulai
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 text-sm">
              <Shield className="w-4 h-4 text-[#2ECC71]" />
              Data CV aman & privat
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 text-sm">
              <Zap className="w-4 h-4 text-[#2ECC71]" />
              Hasil dalam hitungan menit
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B2D5B] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-blue-300 text-sm">{footerText}</p>
        </div>
      </footer>
    </div>
  );
}
