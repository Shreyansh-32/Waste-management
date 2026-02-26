"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Leaf, Menu, X, AlertCircle,
  LogIn, LogOut, LayoutDashboard,
  Sun, Moon,
} from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface NavUser {
  name?:  string | null;
  email?: string | null;
  image?: string | null;
  role?:  string;
}

interface NavbarProps {
  user?: NavUser;
}

const navLinks = [
  { label: "Features",     href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Analytics",    href: "#analytics" },
  { label: "Contact",      href: "#contact" },
];

export default function Navbar({ user }: NavbarProps) {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-emerald-100 dark:border-emerald-900/40 shadow-sm"
            : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-linear-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 group-hover:shadow-emerald-300 transition-shadow">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-[15px] hidden sm:block">
                Smart<span className="text-emerald-600">Campus</span>
              </span>
            </Link>

            {/* ── Desktop nav links ── */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-all"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* ── Desktop auth area ── */}
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="h-10 w-10 rounded-xl border border-emerald-100/80 dark:border-emerald-900/40 bg-white/80 dark:bg-slate-900/70 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                aria-label="Toggle theme"
                suppressHydrationWarning
              >
                {theme === "dark" ? (
                  <Sun className="w-5 h-5 mx-auto" />
                ) : (
                  <Moon className="w-5 h-5 mx-auto" />
                )}
              </button>
              {user ? (
                /* Signed-in */
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2.5 bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 hover:border-emerald-300 rounded-xl px-3 py-2 transition-all shadow-sm"
                  >
                    <div className="w-7 h-7 rounded-lg bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-none">
                        {user.name ?? "User"}
                      </p>
                      {user.role && (
                        <p className="text-[10px] text-emerald-600 font-medium capitalize leading-none mt-0.5">
                          {user.role}
                        </p>
                      )}
                    </div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/60 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-emerald-50/50 dark:bg-emerald-900/20">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{user.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href="/dashboard"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-700 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Signed-out */
                <>
                  <Link
                    href="/signin"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign in
                  </Link>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link
                      href="/signup"
                      className="flex items-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-shadow"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Report Issue
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ── */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-emerald-100 dark:border-emerald-900/40 shadow-lg md:hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-all"
                >
                  {link.label}
                </a>
              ))}

              <div className="border-t border-slate-100 dark:border-slate-800 mt-2 pt-3 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-emerald-700 dark:text-emerald-200 border border-emerald-100/80 dark:border-emerald-900/40 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
                  aria-label="Toggle theme"
                  suppressHydrationWarning
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                  Toggle theme
                </button>
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                      <div className="w-9 h-9 rounded-xl bg-linear-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 bg-linear-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold px-4 py-3 rounded-xl"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Report Issue
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}