import { useParams, Link } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useCVSession } from "~/hooks/use-cv-session";
import { useConfigurables } from "~/modules/configurables";
import { invokeLLM } from "@qb/agentic";
import type { MockQuestion } from "~/hooks/use-cv-session";
import {
  FileText,
  ClipboardList,
  MessageSquare,
  Send,
  ChevronRight,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Star,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Award,
} from "lucide-react";

interface AnswerFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  sample_answer?: string;
  overall_comment: string;
}

interface QuestionState {
  question: MockQuestion;
  userAnswer: string;
  feedback: AnswerFeedback | null;
  loading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  behavioral: "Behavioral",
  technical: "Teknikal",
  situational: "Situasional",
  motivational: "Motivasional",
};

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "bg-blue-100 text-blue-700",
  technical: "bg-purple-100 text-purple-700",
  situational: "bg-yellow-100 text-yellow-700",
  motivational: "bg-green-100 text-green-700",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80 ? "bg-[#2ECC71]/10 text-[#2ECC71]" : score >= 60 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-600";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold ${color}`}>
      <Star className="w-3.5 h-3.5" />
      {score}/100
    </span>
  );
}

export default function MockInterviewPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading } = useCVSession(sessionId);
  const { config } = useConfigurables();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionStates, setQuestionStates] = useState<QuestionState[]>([]);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mockInterviewStartLabel = config.mockInterviewStartLabel ?? "Mulai Latihan";

  useEffect(() => {
    if (session?.result?.mock_interview?.questions) {
      setQuestionStates(
        session.result.mock_interview.questions.map((q) => ({
          question: q,
          userAnswer: "",
          feedback: null,
          loading: false,
        }))
      );
    }
  }, [session]);

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

  const questions = session.result?.mock_interview?.questions ?? [];
  const currentState = questionStates[currentIndex];
  const answeredCount = questionStates.filter((qs) => qs.feedback !== null).length;
  const totalScore =
    answeredCount > 0
      ? Math.round(
          questionStates.filter((qs) => qs.feedback).reduce((sum, qs) => sum + (qs.feedback?.score ?? 0), 0) /
            answeredCount
        )
      : 0;

  async function submitAnswer() {
    if (!currentState || !currentState.userAnswer.trim()) return;

    setQuestionStates((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], loading: true };
      return next;
    });

    try {
      const result = await invokeLLM({
        message: `Posisi yang dilamar: ${session!.jobTitle}

Pertanyaan Wawancara:
"${currentState.question.question}"

Kategori: ${CATEGORY_LABELS[currentState.question.category ?? "behavioral"]}

Jawaban Kandidat:
"${currentState.userAnswer}"`,
        schema: {
          type: "object",
          properties: {
            score: { type: "number", description: "Skor jawaban 0-100" },
            strengths: { type: "array", items: { type: "string" }, description: "Kelebihan jawaban" },
            improvements: { type: "array", items: { type: "string" }, description: "Area yang perlu diperbaiki" },
            sample_answer: { type: "string", description: "Contoh jawaban yang lebih baik menggunakan metode STAR" },
            overall_comment: { type: "string", description: "Komentar keseluruhan yang konstruktif" },
          },
          required: ["score", "strengths", "improvements", "overall_comment"],
        },
        systemPrompt: `Kamu adalah interviewer profesional yang berpengalaman. Evaluasi jawaban kandidat untuk posisi ${session!.jobTitle} secara konstruktif dan objektif. Berikan feedback yang spesifik dan actionable dalam Bahasa Indonesia.`,
      });

      if (result.status === "DONE" && result.response) {
        const feedback = result.response as unknown as AnswerFeedback;
        setQuestionStates((prev) => {
          const next = [...prev];
          next[currentIndex] = { ...next[currentIndex], feedback, loading: false };
          return next;
        });
      } else {
        throw new Error(result.error ?? "Gagal mendapatkan feedback");
      }
    } catch (err: any) {
      setQuestionStates((prev) => {
        const next = [...prev];
        next[currentIndex] = {
          ...next[currentIndex],
          loading: false,
          feedback: {
            score: 0,
            strengths: [],
            improvements: ["Tidak dapat memproses feedback. Silakan coba lagi."],
            overall_comment: err.message ?? "Terjadi kesalahan",
          },
        };
        return next;
      });
    }
  }

  function nextQuestion() {
    if (currentIndex < questionStates.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTimeout(() => textareaRef.current?.focus(), 100);
    } else {
      setCompleted(true);
    }
  }

  function resetSession() {
    setQuestionStates(
      questions.map((q) => ({
        question: q,
        userAnswer: "",
        feedback: null,
        loading: false,
      }))
    );
    setCurrentIndex(0);
    setStarted(false);
    setCompleted(false);
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
        {started && (
          <button
            onClick={resetSession}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E5E7EB] text-[#6B7280] text-sm font-medium hover:text-[#1B2D5B] hover:border-[#1B2D5B] transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Mulai Ulang
          </button>
        )}
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
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[#6B7280] hover:text-[#1B2D5B] text-sm font-medium transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          Rencana Persiapan
        </Link>
        <Link
          to={`/app/${sessionId}/mock-interview`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1B2D5B] text-white text-sm font-medium"
        >
          <MessageSquare className="w-4 h-4" />
          Mock Interview
        </Link>
      </div>

      {/* Completed screen */}
      {completed && (
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="w-20 h-20 rounded-full bg-[#2ECC71]/10 flex items-center justify-center mx-auto mb-6">
            <Award className="w-10 h-10 text-[#2ECC71]" />
          </div>
          <h2 className="text-2xl font-bold text-[#1B2D5B] mb-3">Sesi Selesai!</h2>
          <p className="text-[#6B7280] mb-6">
            Kamu telah menyelesaikan semua pertanyaan mock interview.
          </p>
          <div className="inline-flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-2xl px-8 py-5 shadow-sm mb-8">
            <TrendingUp className="w-6 h-6 text-[#2ECC71]" />
            <div className="text-left">
              <p className="text-xs text-[#6B7280]">Skor Rata-rata</p>
              <p className="text-3xl font-bold text-[#1B2D5B]">{totalScore}/100</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {questionStates.map((qs, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] rounded-xl p-4 text-left">
                <p className="text-xs text-[#9CA3AF] mb-1">Pertanyaan {i + 1}</p>
                <p className="text-xs text-[#374151] mb-2 line-clamp-2">{qs.question.question}</p>
                {qs.feedback && <ScoreBadge score={qs.feedback.score} />}
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={resetSession}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#E5E7EB] text-[#1B2D5B] font-semibold hover:bg-[#F8F9FA] transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Ulangi Latihan
            </button>
            <Link
              to="/app/new"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all"
            >
              Sesi Baru
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Intro screen */}
      {!started && !completed && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#1B2D5B]/10 flex items-center justify-center mx-auto mb-5">
              <MessageSquare className="w-8 h-8 text-[#1B2D5B]" />
            </div>
            <h2 className="text-xl font-bold text-[#1B2D5B] mb-3">Siap untuk Mock Interview?</h2>
            <p className="text-[#6B7280] text-sm mb-4 max-w-md mx-auto">
              AI akan mengajukan {questions.length} pertanyaan wawancara yang relevan untuk posisi{" "}
              <strong className="text-[#1B2D5B]">{session.jobTitle}</strong>. Jawab setiap pertanyaan dengan
              jujur dan dapatkan feedback langsung.
            </p>
            <div className="flex items-center justify-center gap-6 mb-6 flex-wrap">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B2D5B]">{questions.length}</p>
                <p className="text-xs text-[#9CA3AF]">Pertanyaan</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B2D5B]">AI</p>
                <p className="text-xs text-[#9CA3AF]">Feedback Langsung</p>
              </div>
              <div className="w-px h-10 bg-[#E5E7EB]" />
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1B2D5B]">100</p>
                <p className="text-xs text-[#9CA3AF]">Skor Maks</p>
              </div>
            </div>
            <button
              onClick={() => { setStarted(true); setTimeout(() => textareaRef.current?.focus(), 100); }}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all shadow-md"
            >
              <MessageSquare className="w-5 h-5" />
              {mockInterviewStartLabel}
            </button>
          </div>
        </div>
      )}

      {/* Interview screen */}
      {started && !completed && currentState && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: question list */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E5E7EB]">
                <h3 className="text-sm font-semibold text-[#1B2D5B]">Daftar Pertanyaan</h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {answeredCount}/{questions.length} selesai
                </p>
              </div>
              <div className="divide-y divide-[#E5E7EB]">
                {questionStates.map((qs, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full flex items-center gap-3 p-4 text-left hover:bg-[#F8F9FA] transition-colors ${
                      i === currentIndex ? "bg-[#1B2D5B]/5" : ""
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        qs.feedback
                          ? "bg-[#2ECC71] text-white"
                          : i === currentIndex
                          ? "bg-[#1B2D5B] text-white"
                          : "bg-[#E5E7EB] text-[#9CA3AF]"
                      }`}
                    >
                      {qs.feedback ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-[#374151] line-clamp-2">{qs.question.question}</p>
                      {qs.feedback && (
                        <p className="text-xs font-semibold text-[#2ECC71] mt-0.5">
                          Skor: {qs.feedback.score}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: current question + answer */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-4">
            {/* Progress */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-[#6B7280]">
                Pertanyaan {currentIndex + 1} dari {questions.length}
              </span>
              <div className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full">
                <div
                  className="h-full bg-[#2ECC71] rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-[#1B2D5B] rounded-2xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#2ECC71] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-[#2ECC71]">Pewawancara AI</span>
                    {currentState.question.category && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          CATEGORY_COLORS[currentState.question.category] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {CATEGORY_LABELS[currentState.question.category]}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-base leading-relaxed">{currentState.question.question}</p>
                </div>
              </div>
              {currentState.question.hint && !currentState.feedback && (
                <div className="ml-11 mt-3 bg-white/10 rounded-xl p-3">
                  <p className="text-xs text-blue-200">
                    <span className="font-semibold">Tips: </span>
                    {currentState.question.hint}
                  </p>
                </div>
              )}
            </div>

            {/* Answer area or feedback */}
            {!currentState.feedback ? (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                <label className="block text-sm font-medium text-[#374151] mb-2">Jawaban Kamu</label>
                <textarea
                  ref={textareaRef}
                  value={currentState.userAnswer}
                  onChange={(e) => {
                    setQuestionStates((prev) => {
                      const next = [...prev];
                      next[currentIndex] = { ...next[currentIndex], userAnswer: e.target.value };
                      return next;
                    });
                  }}
                  placeholder="Tulis jawabanmu di sini dengan detail dan terstruktur..."
                  rows={5}
                  disabled={currentState.loading}
                  className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] text-sm text-[#2D2D2D] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1B2D5B]/30 focus:border-[#1B2D5B] resize-none transition-all disabled:opacity-60"
                />
                <div className="flex justify-between items-center mt-3">
                  <p className="text-xs text-[#9CA3AF]">
                    {currentState.userAnswer.length} karakter
                  </p>
                  <button
                    onClick={submitAnswer}
                    disabled={!currentState.userAnswer.trim() || currentState.loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1B2D5B] text-white text-sm font-semibold hover:bg-[#2ECC71] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currentState.loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengevaluasi...
                      </>
                    ) : (
                      <>
                        Kirim Jawaban
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* User's answer recap */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#1B2D5B]/10 flex items-center justify-center shrink-0 text-xs font-bold text-[#1B2D5B]">
                      K
                    </div>
                    <div>
                      <p className="text-xs text-[#9CA3AF] mb-1">Jawaban Kamu</p>
                      <p className="text-sm text-[#374151] leading-relaxed">{currentState.userAnswer}</p>
                    </div>
                  </div>
                </div>

                {/* Feedback card */}
                <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#1B2D5B]">Feedback AI</h4>
                    <ScoreBadge score={currentState.feedback.score} />
                  </div>
                  <p className="text-sm text-[#374151] mb-4 leading-relaxed">
                    {currentState.feedback.overall_comment}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {currentState.feedback.strengths.length > 0 && (
                      <div className="bg-[#2ECC71]/5 rounded-xl p-3">
                        <p className="text-xs font-semibold text-[#2ECC71] mb-2">Kelebihan</p>
                        <ul className="space-y-1">
                          {currentState.feedback.strengths.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[#374151]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#2ECC71] mt-0.5 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {currentState.feedback.improvements.length > 0 && (
                      <div className="bg-orange-50 rounded-xl p-3">
                        <p className="text-xs font-semibold text-orange-600 mb-2">Perlu Ditingkatkan</p>
                        <ul className="space-y-1">
                          {currentState.feedback.improvements.map((imp, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-[#374151]">
                              <TrendingUp className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  {currentState.feedback.sample_answer && (
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-xs font-semibold text-blue-700 mb-1.5">Contoh Jawaban yang Lebih Baik</p>
                      <p className="text-xs text-blue-800 leading-relaxed">{currentState.feedback.sample_answer}</p>
                    </div>
                  )}
                </div>

                {/* Next button */}
                <div className="flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1B2D5B] text-white font-semibold hover:bg-[#2ECC71] transition-all"
                  >
                    {currentIndex < questionStates.length - 1 ? (
                      <>
                        Pertanyaan Berikutnya
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Lihat Hasil Akhir
                        <Award className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
