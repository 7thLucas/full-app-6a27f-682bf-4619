import { Link } from "react-router";
import { useState, useEffect } from "react";
import { useAuth } from "~/modules/authentication";
import { useConfigurables } from "~/modules/configurables";
import { Navbar } from "~/components/layout/navbar";
import { getUserFromRequest } from "~/modules/authentication/authentication.server";
import { redirect } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import type { SessionHistoryEntry } from "~/hooks/use-cv-session";
import {
  Plus,
  FileText,
  Clock,
  ChevronRight,
  Briefcase,
  MessageSquare,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = getUserFromRequest(request);
  if (!user) return redirect("/auth/login");
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { config, loading } = useConfigurables();
  const [history, setHistory] = useState<SessionHistoryEntry[]>([]);

  const appName = loading ? "CVTailor" : (config.appName ?? "CVTailor");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cv_sessions");
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // localStorage unavailable
    }
  }, []);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-[#9CA3AF] mb-1">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dasbor
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1B2D5B]">
            Selamat datang, {user?.username}!
          </h1>
          <p className="text-[#6B7280] mt-1">
            Mulai sesi baru atau lanjutkan sesi sebelumnya.
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#1B2D5B]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#1B2D5B]" />
              </div>
              <p className="text-sm text-[#6B7280] font-medium">Total Sesi</p>
            </div>
            <p className="text-3xl font-bold text-[#1B2D5B]">{history.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-[#2ECC71]" />
              </div>
              <p className="text-sm text-[#6B7280] font-medium">Pekerjaan Dianalisis</p>
            </div>
            <p className="text-3xl font-bold text-[#1B2D5B]">{history.length}</p>
          </div>
          <div className="bg-gradient-to-br from-[#1B2D5B] to-[#243d7a] rounded-2xl p-5 flex flex-col justify-between">
            <p className="text-blue-200 text-sm font-medium mb-3">Siap melamar pekerjaan baru?</p>
            <Link
              to="/app/new"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2ECC71] text-white text-sm font-semibold hover:bg-green-400 transition-all"
            >
              <Plus className="w-4 h-4" />
              Sesi Baru
            </Link>
          </div>
        </div>

        {/* Session history */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[#E5E7EB] flex items-center justify-between">
            <h2 className="font-semibold text-[#1B2D5B]">Riwayat Sesi</h2>
            <Link
              to="/app/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1B2D5B] text-white text-xs font-medium hover:bg-[#2ECC71] transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Sesi Baru
            </Link>
          </div>

          {history.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#1B2D5B]/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-[#1B2D5B]/40" />
              </div>
              <h3 className="text-base font-semibold text-[#1B2D5B] mb-2">Belum ada sesi</h3>
              <p className="text-[#6B7280] text-sm mb-6 max-w-xs mx-auto">
                Mulai sesi pertamamu untuk menganalisis CV dan mempersiapkan wawancara.
              </p>
              <Link
                to="/app/new"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all"
              >
                <Plus className="w-4 h-4" />
                Mulai Sesi Pertama
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {history.map((entry) => (
                <div
                  key={entry.sessionId}
                  className="p-5 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#1B2D5B]/10 flex items-center justify-center shrink-0">
                      <Briefcase className="w-5 h-5 text-[#1B2D5B]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1B2D5B] truncate">{entry.jobTitle}</p>
                      <div className="flex items-center gap-1.5 text-xs text-[#9CA3AF] mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(entry.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link
                      to={`/app/${entry.sessionId}/tailored-cv`}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#1B2D5B] hover:bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#1B2D5B] transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      CV
                    </Link>
                    <Link
                      to={`/app/${entry.sessionId}/prep-plan`}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#1B2D5B] hover:bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#1B2D5B] transition-all"
                    >
                      <ClipboardList className="w-3.5 h-3.5" />
                      Persiapan
                    </Link>
                    <Link
                      to={`/app/${entry.sessionId}/mock-interview`}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#1B2D5B] hover:bg-[#F8F9FA] border border-[#E5E7EB] hover:border-[#1B2D5B] transition-all"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      Interview
                    </Link>
                    <Link
                      to={`/app/${entry.sessionId}/tailored-cv`}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1B2D5B] hover:bg-[#2ECC71] transition-all"
                    >
                      Buka
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
