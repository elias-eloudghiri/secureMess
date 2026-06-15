import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Key,
  User,
  Copy,
  ArrowRight,
  Check,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
interface AuthProps {
  onLogin: () => void;
  initialMode?: "login" | "register" | "show-uuid";
}
export function Auth({ onLogin, initialMode = "login" }: AuthProps) {
  const [mode, setMode] = useState<"login" | "register" | "show-uuid">(
    initialMode,
  );
  const [uuid, setUuid] = useState("");
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (uuid.trim() && password.trim()) {
      onLogin();
    }
  };
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      // Génération d'un UUID (fallback si crypto.randomUUID n'est pas dispo)
      const newUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "sig-" +
            Math.random().toString(36).substring(2, 10) +
            "-" +
            Math.random().toString(36).substring(2, 10);
      setUuid(newUuid);
      setMode("show-uuid");
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(uuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const variants = {
    initial: {
      opacity: 0,
      x: 20,
    },
    animate: {
      opacity: 1,
      x: 0,
    },
    exit: {
      opacity: 0,
      x: -20,
    },
  };
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans transition-colors relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-[2rem] shadow-xl dark:shadow-2xl dark:shadow-black/50 overflow-hidden p-8 border border-transparent dark:border-gray-800 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            SecureMess
          </h1>
        </div>

        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.form
              key="login"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.2,
              }}
              onSubmit={handleLogin}
              className="space-y-5"
            >
              <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
                Connexion
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={uuid}
                    onChange={(e) => setUuid(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                    placeholder="Votre identifiant (UUID)"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                    placeholder="Mot de passe"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Se connecter
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Nouveau sur SecureMess ?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setPassword("");
                    setUuid("");
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Créer un compte
                </button>
              </p>
            </motion.form>
          )}

          {mode === "register" && (
            <motion.form
              key="register"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.2,
              }}
              onSubmit={handleRegister}
              className="space-y-5"
            >
              <h2 className="text-xl font-semibold text-center text-gray-800 dark:text-gray-100 mb-6">
                Créer un compte
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
                Choisissez un mot de passe. Un identifiant unique (UUID) vous
                sera généré à l'étape suivante.
              </p>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-100 dark:bg-gray-800 border-transparent rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:bg-white dark:focus:bg-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/50 transition-all"
                  placeholder="Choisissez un mot de passe"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Générer mon identifiant
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                Vous avez déjà un compte ?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setPassword("");
                  }}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Se connecter
                </button>
              </p>
            </motion.form>
          )}

          {mode === "show-uuid" && (
            <motion.div
              key="show-uuid"
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                duration: 0.2,
              }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Votre identifiant
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Conservez cet identifiant précieusement, il vous sera demandé
                  pour vous connecter.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 relative group transition-colors">
                <p className="text-center font-mono text-sm text-gray-800 dark:text-gray-200 break-all pr-8">
                  {uuid}
                </p>
                <button
                  onClick={copyToClipboard}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="Copier l'identifiant"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-500" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continuer vers l'application
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
