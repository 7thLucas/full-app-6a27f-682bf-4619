import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { invokeLLM } from "@qb/agentic";
import {
  Upload,
  FileText,
  Briefcase,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AnalysisStep = "idle" | "uploading" | "analyzing" | "tailoring" | "done" | "error";

const STEP_LABELS: Record<AnalysisStep, string> = {
  idle: "",
  uploading: "Mengunggah CV...",
  analyzing: "Menganalisis CV & Pekerjaan...",
  tailoring: "Menyesuaikan CV dengan AI...",
  done: "Selesai!",
  error: "Terjadi kesalahan",
};

export default function NewSessionPage() {
  const { config, loading } = useConfigurables();
  const navigate = useNavigate();

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvText, setCvText] = useState("");
  const [cvInputMode, setCvInputMode] = useState<"file" | "text">("file");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [step, setStep] = useState<AnalysisStep>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cvUploadLabel = loading ? "Unggah CV Kamu (PDF)" : (config.cvUploadLabel ?? "Unggah CV Kamu (PDF)");
  const jobInputLabel = loading ? "Deskripsi Pekerjaan" : (config.jobInputLabel ?? "Deskripsi Pekerjaan");
  const analyzeCtaLabel = loading ? "Analisis CV Saya" : (config.analyzeCtaLabel ?? "Analisis CV Saya");

  function handleFileSelect(file: File) {
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setErrorMessage("Hanya file PDF yang didukung.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran file maksimal 10MB.");
      return;
    }
    setErrorMessage("");
    setCvFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleAnalyze() {
    if (!jobTitle.trim() || !jobDescription.trim()) {
      setErrorMessage("Harap isi judul pekerjaan dan deskripsi pekerjaan.");
      return;
    }
    if (cvInputMode === "file" && !cvFile) {
      setErrorMessage("Harap unggah CV atau beralih ke mode teks.");
      return;
    }
    if (cvInputMode === "text" && !cvText.trim()) {
      setErrorMessage("Harap tempel teks CV kamu.");
      return;
    }
    setErrorMessage("");
    setStep("uploading");

    try {
      // Step 1: Upload CV file if file mode
      let cvContent = cvText;
      let cvFileForLLM: File | undefined;

      if (cvInputMode === "file" && cvFile) {
        // Upload CV to uploader service
        setStep("uploading");
        const uploadForm = new FormData();
        uploadForm.append("file", cvFile);
        const uploadRes = await fetch("/api/uploader/document", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData.success) {
          throw new Error("Gagal mengunggah CV. Coba lagi.");
        }
        cvFileForLLM = cvFile;
      }

      setStep("analyzing");

      // Step 2: Analyze CV vs job using AI
      const systemPrompt = `Kamu adalah asisten karir AI yang ahli dalam tailoring CV untuk posisi pekerjaan spesifik.
Analisis CV kandidat dan deskripsi pekerjaan yang diberikan, lalu hasilkan:
1. CV yang disesuaikan (tailored) dengan mengutamakan pengalaman relevan
2. Rencana persiapan wawancara yang terstruktur
3. Daftar pertanyaan mock interview yang relevan

Selalu gunakan Bahasa Indonesia yang profesional.`;

      const message = `Posisi yang dilamar: ${jobTitle}

Deskripsi Pekerjaan:
${jobDescription}

${cvInputMode === "text" ? `CV Kandidat:\n${cvContent}` : "CV kandidat terlampir sebagai file PDF."}`;

      setStep("tailoring");

      const schema = {
        type: "object",
        properties: {
          tailored_cv: {
            type: "object",
            properties: {
              summary: { type: "string", description: "Professional summary disesuaikan untuk posisi ini" },
              key_skills: { type: "array", items: { type: "string" }, description: "Skill utama yang relevan" },
              experience_highlights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    company: { type: "string" },
                    duration: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } },
                  },
                },
                description: "Pengalaman kerja yang dioptimalkan",
              },
              keywords_matched: { type: "array", items: { type: "string" }, description: "Kata kunci dari job desc yang cocok" },
              keywords_missing: { type: "array", items: { type: "string" }, description: "Kata kunci yang kurang/perlu ditambahkan" },
              ats_score: { type: "number", description: "Perkiraan skor ATS 0-100" },
              match_notes: { type: "string", description: "Catatan tentang kesesuaian CV dengan pekerjaan" },
            },
            required: ["summary", "key_skills", "keywords_matched", "keywords_missing", "ats_score"],
          },
          prep_plan: {
            type: "object",
            properties: {
              overview: { type: "string", description: "Ringkasan rencana persiapan" },
              topics: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    category: { type: "string" },
                    items: { type: "array", items: { type: "string" } },
                    priority: { type: "string", enum: ["tinggi", "sedang", "rendah"] },
                  },
                },
                description: "Topik persiapan berdasarkan kategori",
              },
              study_schedule: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    day: { type: "string" },
                    focus: { type: "string" },
                    tasks: { type: "array", items: { type: "string" } },
                  },
                },
                description: "Jadwal belajar per hari",
              },
              company_research_tips: { type: "array", items: { type: "string" }, description: "Tips riset perusahaan" },
            },
            required: ["overview", "topics"],
          },
          mock_interview: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    question: { type: "string" },
                    category: { type: "string", enum: ["behavioral", "technical", "situational", "motivational"] },
                    hint: { type: "string", description: "Tips menjawab pertanyaan ini" },
                  },
                },
                description: "Daftar pertanyaan wawancara yang relevan",
              },
            },
            required: ["questions"],
          },
        },
        required: ["tailored_cv", "prep_plan", "mock_interview"],
      };

      const result = await invokeLLM({
        message,
        schema,
        systemPrompt,
        files: cvFileForLLM ? [cvFileForLLM] : undefined,
      });

      if (result.status === "ERROR" || !result.response) {
        throw new Error(result.error ?? "AI gagal menganalisis. Coba lagi.");
      }

      // Store results in sessionStorage
      const sessionId = Date.now().toString();
      const sessionData = {
        sessionId,
        jobTitle,
        jobDescription,
        cvText: cvInputMode === "text" ? cvContent : `[File: ${cvFile?.name}]`,
        result: result.response,
        createdAt: new Date().toISOString(),
      };

      // Store in sessionStorage (privacy-first: not persisted server-side)
      sessionStorage.setItem(`cv_session_${sessionId}`, JSON.stringify(sessionData));

      // Also keep a list of recent sessions in localStorage
      const history = JSON.parse(localStorage.getItem("cv_sessions") ?? "[]");
      history.unshift({ sessionId, jobTitle, createdAt: sessionData.createdAt });
      localStorage.setItem("cv_sessions", JSON.stringify(history.slice(0, 10)));

      setStep("done");
      navigate(`/app/${sessionId}/tailored-cv`);
    } catch (err: any) {
      setStep("error");
      setErrorMessage(err.message ?? "Terjadi kesalahan. Silakan coba lagi.");
    }
  }

  const isLoading = ["uploading", "analyzing", "tailoring"].includes(step);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1B2D5B] mb-2">Sesi Analisis Baru</h1>
        <p className="text-[#6B7280]">Unggah CV dan masukkan informasi pekerjaan untuk memulai analisis AI.</p>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-[#1B2D5B]/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <div className="bg-white rounded-2xl p-10 max-w-sm w-full mx-4 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-[#1B2D5B]/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-[#1B2D5B] animate-spin" />
            </div>
            <h3 className="text-lg font-semibold text-[#1B2D5B] mb-2">{STEP_LABELS[step]}</h3>
            <p className="text-[#6B7280] text-sm">Mohon tunggu, AI sedang bekerja untukmu...</p>
            <div className="mt-6 space-y-2">
              {(["uploading", "analyzing", "tailoring"] as AnalysisStep[]).map((s) => {
                const steps: AnalysisStep[] = ["uploading", "analyzing", "tailoring"];
                const currentIndex = steps.indexOf(step);
                const thisIndex = steps.indexOf(s);
                const isDone = thisIndex < currentIndex;
                const isActive = s === step;
                return (
                  <div key={s} className="flex items-center gap-3 text-left">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        isDone
                          ? "bg-[#2ECC71]"
                          : isActive
                          ? "bg-[#1B2D5B]"
                          : "bg-[#E5E7EB]"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      ) : isActive ? (
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ) : null}
                    </div>
                    <span
                      className={`text-sm ${
                        isDone ? "text-[#2ECC71]" : isActive ? "text-[#1B2D5B] font-medium" : "text-[#9CA3AF]"
                      }`}
                    >
                      {STEP_LABELS[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: CV Input */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#1B2D5B]/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-[#1B2D5B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1B2D5B]">{cvUploadLabel}</h2>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-[#F8F9FA] p-1 mb-5">
            <button
              onClick={() => setCvInputMode("file")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                cvInputMode === "file"
                  ? "bg-white text-[#1B2D5B] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1B2D5B]"
              }`}
            >
              Unggah PDF
            </button>
            <button
              onClick={() => setCvInputMode("text")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                cvInputMode === "text"
                  ? "bg-white text-[#1B2D5B] shadow-sm"
                  : "text-[#6B7280] hover:text-[#1B2D5B]"
              }`}
            >
              Tempel Teks
            </button>
          </div>

          {cvInputMode === "file" ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#2ECC71] bg-[#2ECC71]/5"
                  : cvFile
                  ? "border-[#2ECC71] bg-[#2ECC71]/5"
                  : "border-[#E5E7EB] hover:border-[#1B2D5B]/40 hover:bg-[#F8F9FA]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
              />
              {cvFile ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-[#2ECC71]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1B2D5B] text-sm">{cvFile.name}</p>
                    <p className="text-xs text-[#6B7280]">{(cvFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCvFile(null); }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <X className="w-3 h-3" />
                    Hapus
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1B2D5B]/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#1B2D5B]" />
                  </div>
                  <div>
                    <p className="font-medium text-[#1B2D5B] text-sm">Seret file ke sini atau klik untuk memilih</p>
                    <p className="text-xs text-[#9CA3AF] mt-1">PDF hingga 10MB</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Tempel isi CV kamu di sini..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#2D2D2D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B2D5B]/30 focus:border-[#1B2D5B] resize-none transition-all"
            />
          )}
        </div>

        {/* Right: Job Description */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-[#1B2D5B]/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-[#1B2D5B]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1B2D5B]">{jobInputLabel}</h2>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Judul Pekerjaan *</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="cth: Software Engineer, Product Manager, Data Analyst"
              className="w-full px-4 py-2.5 rounded-xl border border-[#E5E7EB] text-sm text-[#2D2D2D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B2D5B]/30 focus:border-[#1B2D5B] transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              Deskripsi & Persyaratan Pekerjaan *
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Tempel deskripsi lengkap pekerjaan termasuk kualifikasi, tanggung jawab, dan persyaratan..."
              rows={10}
              className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#2D2D2D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B2D5B]/30 focus:border-[#1B2D5B] resize-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Error */}
      {(errorMessage || step === "error") && (
        <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{errorMessage || "Terjadi kesalahan. Silakan coba lagi."}</p>
        </div>
      )}

      {/* Submit button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B2D5B] text-white font-semibold text-base hover:bg-[#2ECC71] transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Menganalisis...
            </>
          ) : (
            <>
              {analyzeCtaLabel}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
