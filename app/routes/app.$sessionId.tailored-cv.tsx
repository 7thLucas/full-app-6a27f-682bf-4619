import { useParams, Link } from "react-router";
import { useCVSession } from "~/hooks/use-cv-session";
import { useConfigurables } from "~/modules/configurables";
import {
  Download,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ArrowLeft,
  FileText,
  ClipboardList,
  MessageSquare,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";

const PRIORITY_COLORS = {
  match: "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20",
  missing: "bg-red-50 text-red-600 border-red-200",
};

function ScoreRing({ score }: { score: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const fill = (score / 100) * circumference;
  const color = score >= 80 ? "#2ECC71" : score >= 60 ? "#F59E0B" : "#EF4444";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeDasharray={`${fill} ${circumference}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>
          {score}
        </span>
        <span className="text-[10px] text-[#9CA3AF] font-medium">ATS</span>
      </div>
    </div>
  );
}

export default function TailoredCVPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading } = useCVSession(sessionId);
  const { config } = useConfigurables();

  const downloadCvLabel = config.downloadCvLabel ?? "Unduh CV Disesuaikan";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1B2D5B]" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-[#1B2D5B] mb-3">Sesi Tidak Ditemukan</h2>
        <p className="text-[#6B7280] mb-6">
          Data sesi mungkin telah kadaluarsa atau tidak tersedia. Mulai sesi baru.
        </p>
        <Link
          to="/app/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all"
        >
          Sesi Baru
        </Link>
      </div>
    );
  }

  const cv = session.result?.tailored_cv ?? {};
  const atsScore = cv.ats_score ?? 0;

  function downloadAsText() {
    const lines: string[] = [];
    lines.push(`===== CV DISESUAIKAN =====`);
    lines.push(`Posisi: ${session!.jobTitle}`);
    lines.push(`Dibuat: ${new Date(session!.createdAt).toLocaleDateString("id-ID")}`);
    lines.push("");
    lines.push("--- SUMMARY PROFESIONAL ---");
    lines.push(cv.summary ?? "");
    lines.push("");
    if (cv.key_skills?.length) {
      lines.push("--- SKILL UTAMA ---");
      lines.push(cv.key_skills.join(" | "));
      lines.push("");
    }
    if (cv.experience_highlights?.length) {
      lines.push("--- PENGALAMAN KERJA ---");
      for (const exp of cv.experience_highlights) {
        lines.push(`${exp.title} @ ${exp.company} (${exp.duration})`);
        for (const b of exp.bullets ?? []) lines.push(`  • ${b}`);
        lines.push("");
      }
    }
    lines.push(`Skor ATS: ${atsScore}/100`);
    if (cv.match_notes) { lines.push(""); lines.push("Catatan: " + cv.match_notes); }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CV_Disesuaikan_${session!.jobTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb + nav */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
          <Link to="/dashboard" className="hover:text-[#1B2D5B] transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            Dasbor
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#1B2D5B] font-medium">{session.jobTitle}</span>
        </div>
        <button
          onClick={downloadAsText}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2D5B] text-white text-sm font-medium hover:bg-[#2ECC71] transition-all"
        >
          <Download className="w-4 h-4" />
          {downloadCvLabel}
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1 border border-[#E5E7EB] w-fit shadow-sm">
        <Link
          to={`/app/${sessionId}/tailored-cv`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2D5B] text-white text-sm font-medium"
        >
          <FileText className="w-4 h-4" />
          CV Disesuaikan
        </Link>
        <Link
          to={`/app/${sessionId}/prep-plan`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#6B7280] hover:text-[#1B2D5B] text-sm font-medium transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          Rencana Persiapan
        </Link>
        <Link
          to={`/app/${sessionId}/mock-interview`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#6B7280] hover:text-[#1B2D5B] text-sm font-medium transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Mock Interview
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main CV content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          {cv.summary && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-[#2ECC71]" />
                Summary Profesional
              </h3>
              <p className="text-[#374151] leading-relaxed text-sm">{cv.summary}</p>
            </div>
          )}

          {/* Key Skills */}
          {cv.key_skills && cv.key_skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-4">Skill Utama</h3>
              <div className="flex flex-wrap gap-2">
                {cv.key_skills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-full bg-[#1B2D5B]/10 text-[#1B2D5B] text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience Highlights */}
          {cv.experience_highlights && cv.experience_highlights.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-4">Pengalaman Kerja yang Dioptimalkan</h3>
              <div className="space-y-6">
                {cv.experience_highlights.map((exp, i) => (
                  <div key={i} className="border-l-2 border-[#2ECC71] pl-4">
                    <div className="flex items-start justify-between flex-wrap gap-1 mb-2">
                      <div>
                        <h4 className="font-semibold text-[#1B2D5B] text-sm">{exp.title}</h4>
                        <p className="text-[#6B7280] text-sm">{exp.company}</p>
                      </div>
                      {exp.duration && (
                        <span className="text-xs text-[#9CA3AF] bg-[#F8F9FA] px-2 py-1 rounded-lg">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-1.5">
                      {exp.bullets?.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-[#374151]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] mt-1.5 shrink-0" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar: metrics */}
        <div className="space-y-6">
          {/* ATS Score */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 text-center">
            <h3 className="text-base font-semibold text-[#1B2D5B] mb-4">Skor ATS</h3>
            <div className="flex justify-center mb-3">
              <ScoreRing score={atsScore} />
            </div>
            <p className="text-xs text-[#6B7280]">
              {atsScore >= 80
                ? "Sangat cocok dengan posisi ini!"
                : atsScore >= 60
                ? "Cukup baik, ada ruang untuk ditingkatkan"
                : "Perlu penyesuaian lebih lanjut"}
            </p>
            {cv.match_notes && (
              <p className="text-xs text-[#6B7280] mt-2 border-t border-[#E5E7EB] pt-3">
                {cv.match_notes}
              </p>
            )}
          </div>

          {/* Keywords Matched */}
          {cv.keywords_matched && cv.keywords_matched.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
              <h4 className="text-sm font-semibold text-[#1B2D5B] mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2ECC71]" />
                Kata Kunci Cocok ({cv.keywords_matched.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cv.keywords_matched.map((kw, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-full border text-xs font-medium ${PRIORITY_COLORS.match}`}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords Missing */}
          {cv.keywords_missing && cv.keywords_missing.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
              <h4 className="text-sm font-semibold text-[#1B2D5B] mb-3 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Kata Kunci Kurang ({cv.keywords_missing.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {cv.keywords_missing.map((kw, i) => (
                  <span
                    key={i}
                    className={`px-2 py-0.5 rounded-full border text-xs font-medium ${PRIORITY_COLORS.missing}`}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Next steps */}
          <div className="bg-[#1B2D5B] rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Langkah Berikutnya</h4>
            <div className="space-y-2">
              <Link
                to={`/app/${sessionId}/prep-plan`}
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors group"
              >
                <ClipboardList className="w-4 h-4 shrink-0" />
                Lihat Rencana Persiapan
                <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to={`/app/${sessionId}/mock-interview`}
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm transition-colors group"
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                Mulai Mock Interview
                <ChevronRight className="w-3.5 h-3.5 ml-auto group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
