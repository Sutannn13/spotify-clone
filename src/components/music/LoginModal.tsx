"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, LogIn, AlertCircle, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { signIn, isLoading } = useAdminAuth();
  const formId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setError(null);
    const { error: err } = await signIn(email.trim(), password);
    if (err) {
      setError(err);
    } else {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="login-title"
              aria-describedby="login-description"
              className="pointer-events-auto w-full max-w-sm bg-bg-elevated border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                <div>
                  <h2 id="login-title" className="text-base font-semibold text-text-primary">
                    Admin Sign In
                  </h2>
                  <p id="login-description" className="text-xs text-text-muted mt-0.5">
                    Sign in to manage cloud songs
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close sign in"
                  className="w-8 h-8 flex items-center justify-center rounded-full text-text-muted hover:text-text-primary hover:bg-bg-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form
                id={formId}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 px-6 py-5"
              >
                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary placeholder-text-muted focus:border-border-focus transition-colors"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-text-secondary mb-2"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="login-password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-bg-base border border-border text-sm text-text-primary placeholder-text-muted focus:border-border-focus transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  form={formId}
                  disabled={isLoading || !email.trim() || !password}
                  className="mt-1 w-full py-2.5 rounded-lg text-sm font-semibold bg-text-primary text-bg-base hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}