import { Link, Form } from "react-router";
import { useConfigurables } from "~/modules/configurables";
import { useAuth } from "~/modules/authentication";
import { FileText, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { config, loading } = useConfigurables();
  const { user, isAuthenticated } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const appName = loading ? "CVTailor" : (config.appName ?? "CVTailor");
  const logoUrl = loading ? "" : (config.logoUrl ?? "");

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {logoUrl && logoUrl !== "FILL_LOGO_URL_HERE" ? (
              <img src={logoUrl} alt={appName} className="h-8 w-auto" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#1B2D5B] flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#1B2D5B] text-lg tracking-tight">{appName}</span>
              </div>
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B] transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dasbor
                </Link>
                <Link
                  to="/app/new"
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B] transition-colors"
                >
                  Sesi Baru
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-[#E5E7EB]">
                  <span className="text-sm text-[#6B7280]">{user?.username}</span>
                  <Form method="post" action="/auth/logout">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-red-500 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar
                    </button>
                  </Form>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B] transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/auth/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-[#1B2D5B] text-white hover:bg-[#2ECC71] transition-colors"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-[#6B7280] hover:text-[#1B2D5B]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 pb-4 pt-2 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-2 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B]"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dasbor
              </Link>
              <Link
                to="/app/new"
                className="block py-2 text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B]"
                onClick={() => setMobileOpen(false)}
              >
                Sesi Baru
              </Link>
              <div className="pt-2 border-t border-[#E5E7EB]">
                <span className="block text-xs text-[#9CA3AF] mb-2">{user?.username}</span>
                <Form method="post" action="/auth/logout">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 text-sm font-medium text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </Form>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="block py-2 text-sm font-medium text-[#6B7280] hover:text-[#1B2D5B]"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
              </Link>
              <Link
                to="/auth/register"
                className="block py-2 text-sm font-semibold text-[#1B2D5B]"
                onClick={() => setMobileOpen(false)}
              >
                Daftar Gratis
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
