import { useParams, Link } from "react-router";
import { useState } from "react";
import { useCVSession } from "~/hooks/use-cv-session";
import {
  FileText,
  ClipboardList,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  Building2,
  ChevronUp,
} from "lucide-react";

const PRIORITY_CONFIG = {
  tinggi: { label: "Prioritas Tinggi", color: "bg-red-100 text-red-700 border-red-200" },
  sedang: { label: "Prioritas Sedang", color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  rendah: { label: "Prioritas Rendah", color: "bg-[#2ECC71]/10 text-[#2ECC71] border-[#2ECC71]/20" },
};

export default function PrepPlanPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading } = useCVSession(sessionId);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<number, boolean>>({});

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
        <p className="text-[#6B7280] mb-6">Data sesi mungkin telah kadaluarsa.</p>
        <Link
          to="/app/new"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all"
        >
          Sesi Baru
        </Link>
      </div>
    );
  }

  const plan = session.result?.prep_plan ?? {};
  const allTopicItems = plan.topics?.flatMap((t, ti) =>
    (t.items ?? []).map((item, ii) => ({ key: `${ti}-${ii}`, label: item }))
  ) ?? [];
  const checkedCount = allTopicItems.filter((item) => checkedItems[item.key]).length;
  const progress = allTopicItems.length > 0 ? Math.round((checkedCount / allTopicItems.length) * 100) : 0;

  function toggleItem(key: string) {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function toggleCategory(index: number) {
    setExpandedCategories((prev) => ({
      ...prev,
      [index]: prev[index] === undefined ? false : !prev[index],
    }));
  }

  function downloadPlan() {
    const lines: string[] = [];
    lines.push("===== RENCANA PERSIAPAN WAWANCARA =====");
    lines.push(`Posisi: ${session!.jobTitle}`);
    lines.push(`Dibuat: ${new Date(session!.createdAt).toLocaleDateString("id-ID")}`);
    lines.push("");
    if (plan.overview) {
      lines.push("--- OVERVIEW ---");
      lines.push(plan.overview);
      lines.push("");
    }
    if (plan.topics?.length) {
      lines.push("--- TOPIK PERSIAPAN ---");
      for (const topic of plan.topics) {
        lines.push(`\n[${topic.priority?.toUpperCase()}] ${topic.category}`);
        for (const item of topic.items ?? []) lines.push(`  ☐ ${item}`);
      }
      lines.push("");
    }
    if (plan.study_schedule?.length) {
      lines.push("\n--- JADWAL BELAJAR ---");
      for (const day of plan.study_schedule) {
        lines.push(`\n${day.day}: ${day.focus}`);
        for (const task of day.tasks ?? []) lines.push(`  • ${task}`);
      }
    }
    if (plan.company_research_tips?.length) {
      lines.push("\n--- TIPS RISET PERUSAHAAN ---");
      for (const tip of plan.company_research_tips) lines.push(`• ${tip}`);
    }
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Rencana_Persiapan_${session!.jobTitle.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
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
          onClick={downloadPlan}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1B2D5B] text-white text-sm font-medium hover:bg-[#2ECC71] transition-all"
        >
          <Download className="w-4 h-4" />
          Unduh Rencana
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1 border border-[#E5E7EB] w-fit shadow-sm">
        <Link
          to={`/app/${sessionId}/tailored-cv`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#6B7280] hover:text-[#1B2D5B] text-sm font-medium transition-colors"
        >
          <FileText className="w-4 h-4" />
          CV Disesuaikan
        </Link>
        <Link
          to={`/app/${sessionId}/prep-plan`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2D5B] text-white text-sm font-medium"
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
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Overview */}
          {plan.overview && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#2ECC71]" />
                Ringkasan Rencana
              </h3>
              <p className="text-[#374151] text-sm leading-relaxed">{plan.overview}</p>
            </div>
          )}

          {/* Topics checklist */}
          {plan.topics && plan.topics.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-5 border-b border-[#E5E7EB]">
                <h3 className="text-base font-semibold text-[#1B2D5B] flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-[#2ECC71]" />
                  Daftar Topik Persiapan
                </h3>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-[#6B7280] mb-1.5">
                    <span>{checkedCount} dari {allTopicItems.length} selesai</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#2ECC71] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {plan.topics.map((topic, ti) => {
                  const isExpanded = expandedCategories[ti] !== false;
                  const priority = topic.priority ?? "sedang";
                  const priorityConfig = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG] ?? PRIORITY_CONFIG.sedang;
                  return (
                    <div key={ti}>
                      <button
                        onClick={() => toggleCategory(ti)}
                        className="w-full flex items-center justify-between p-5 hover:bg-[#F8F9FA] transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`px-2 py-0.5 rounded-full border text-xs font-medium ${priorityConfig.color}`}
                          >
                            {priorityConfig.label}
                          </span>
                          <span className="font-medium text-[#1B2D5B] text-sm">{topic.category}</span>
                          <span className="text-xs text-[#9CA3AF]">({topic.items?.length ?? 0})</span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#9CA3AF]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#9CA3AF]" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="px-5 pb-4 space-y-2">
                          {topic.items?.map((item, ii) => {
                            const key = `${ti}-${ii}`;
                            return (
                              <button
                                key={ii}
                                onClick={() => toggleItem(key)}
                                className="w-full flex items-start gap-3 text-left p-2 rounded-lg hover:bg-[#F8F9FA] transition-colors group"
                              >
                                {checkedItems[key] ? (
                                  <CheckSquare className="w-4 h-4 text-[#2ECC71] mt-0.5 shrink-0" />
                                ) : (
                                  <Square className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#1B2D5B] mt-0.5 shrink-0 transition-colors" />
                                )}
                                <span
                                  className={`text-sm transition-colors ${
                                    checkedItems[key] ? "text-[#9CA3AF] line-through" : "text-[#374151]"
                                  }`}
                                >
                                  {item}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Company research tips */}
          {plan.company_research_tips && plan.company_research_tips.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#2ECC71]" />
                Tips Riset Perusahaan
              </h3>
              <ul className="space-y-2">
                {plan.company_research_tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[#374151]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC71] mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar: Study Schedule */}
        <div className="space-y-5">
          {plan.study_schedule && plan.study_schedule.length > 0 && (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#2ECC71]" />
                Jadwal Belajar
              </h3>
              <div className="space-y-4">
                {plan.study_schedule.map((day, di) => (
                  <div key={di} className="border-l-2 border-[#E5E7EB] pl-3">
                    <p className="text-xs font-semibold text-[#1B2D5B] mb-0.5">{day.day}</p>
                    <p className="text-xs text-[#2ECC71] font-medium mb-1.5">{day.focus}</p>
                    <ul className="space-y-1">
                      {day.tasks?.map((task, ti) => (
                        <li key={ti} className="text-xs text-[#6B7280] flex items-start gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#9CA3AF] mt-1.5 shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1B2D5B] rounded-2xl p-5">
            <h4 className="text-sm font-semibold text-white mb-3">Siap Latihan?</h4>
            <p className="text-blue-200 text-xs mb-4">
              Uji persiapanmu dengan sesi mock interview interaktif.
            </p>
            <Link
              to={`/app/${sessionId}/mock-interview`}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2ECC71] text-white text-sm font-semibold hover:bg-green-400 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              Mulai Mock Interview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
