/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TFeatureItem = {
  title: string;
  description: string;
  icon?: string;
};

export type TFeaturesSection = {
  title: string;
  items: TFeatureItem[];
};

export type TStep = {
  number: string;
  title: string;
  description?: string;
};

export type TStepsSection = {
  title: string;
  steps: TStep[];
};

export type TDefaultConfigurableData = {
  appName: string;
  tagline?: string;
  logoUrl: string;
  brandColor: TBrandColor;
  heroHeading?: string;
  heroSubheading?: string;
  heroCta?: string;
  featuresSection?: TFeaturesSection;
  stepsSection?: TStepsSection;
  footerText?: string;
  loginPageTitle?: string;
  registerPageTitle?: string;
  cvUploadLabel?: string;
  jobInputLabel?: string;
  analyzeCtaLabel?: string;
  mockInterviewStartLabel?: string;
  downloadCvLabel?: string;
  showTestimonialsSection?: boolean;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "CVTailor",
  tagline: "Paste a job. Get a tailored CV, interview plan, and mock interview — in minutes.",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#1B2D5B",
    secondary: "#2ECC71",
    accent: "#2ECC71",
  },
  heroHeading: "CV Sempurna untuk Pekerjaan Impianmu",
  heroSubheading:
    "Unggah CV-mu, tempel deskripsi pekerjaan, dan dapatkan CV yang disesuaikan, rencana persiapan wawancara, serta sesi latihan mock interview — semuanya dalam hitungan menit.",
  heroCta: "Mulai Sekarang",
  featuresSection: {
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
  },
  stepsSection: {
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
  },
  footerText: "© 2026 CVTailor. Semua hak dilindungi.",
  loginPageTitle: "Masuk ke CVTailor",
  registerPageTitle: "Daftar CVTailor",
  cvUploadLabel: "Unggah CV Kamu (PDF)",
  jobInputLabel: "Deskripsi Pekerjaan",
  analyzeCtaLabel: "Analisis CV Saya",
  mockInterviewStartLabel: "Mulai Latihan",
  downloadCvLabel: "Unduh CV Disesuaikan",
  showTestimonialsSection: false,
};
