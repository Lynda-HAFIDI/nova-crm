"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    if (isRegisterMode) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage("Compte créé avec succès. Tu peux maintenant te connecter.");
      setIsRegisterMode(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold">
          {isRegisterMode ? "Créer un compte" : "Connexion"}
        </h1>
        <p className="mt-2 text-sm text-slate-400">Nova CRM</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegisterMode && (
            <div>
              <label className="mb-1 block text-sm">Nom complet</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none"
              required
            />
          </div>

          {message && (
            <p className="text-sm text-amber-300">{message}</p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-2 font-semibold text-slate-900"
          >
            {isRegisterMode ? "Créer le compte" : "Se connecter"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => setIsRegisterMode(!isRegisterMode)}
          className="mt-4 text-sm text-slate-300 underline"
        >
          {isRegisterMode
            ? "Déjà un compte ? Se connecter"
            : "Pas encore de compte ? S'inscrire"}
        </button>
      </div>
    </main>
  );
}