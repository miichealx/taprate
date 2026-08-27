"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoadingAuth(false);
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error(
        "LOGIN ERROR:",
        JSON.stringify(error, null, 2)
      );

      setMessage(`خطأ: ${error.message}`);
      return;
    }

    setMessage("تم تسجيل الدخول ✅");
  }

  async function logout() {
    await supabase.auth.signOut();
    setSession(null);
    setMessage("");
  }

  async function addRestaurant(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      setMessage(
        "انتهت جلسة تسجيل الدخول، سجل دخول مرة أخرى."
      );
      return;
    }

    console.log("AUTH USER:", session.user.email);
    console.log("AUTH USER ID:", session.user.id);
    console.log("AUTH SESSION EXISTS:", !!session);

    const { data, error } = await supabase
      .from("restaurants")
      .insert({
        name: name.trim(),
        google_review_url: googleReviewUrl.trim(),
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      console.error(
        "SUPABASE ERROR:",
        JSON.stringify(error, null, 2)
      );

      setMessage(`خطأ: ${error.message}`);
      return;
    }

    setMessage(
      `تم إضافة ${data.name} بنجاح ✅ الرابط: /${data.slug}`
    );

    setName("");
    setGoogleReviewUrl("");
  }

  if (loadingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">
          جاري التحميل...
        </p>
      </main>
    );
  }

  if (!session) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 px-6 py-10"
      >
        <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
          <div className="w-full rounded-3xl bg-white p-8 shadow-xl">

            <div className="mb-8 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-black text-xl font-bold text-white">
                TR
              </div>

              <h1 className="mt-5 text-2xl font-bold text-gray-900">
                TapRate Admin
              </h1>

              <p className="mt-2 text-gray-500">
                تسجيل دخول المسؤول
              </p>
            </div>

            <form
              onSubmit={login}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  البريد الإلكتروني
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  كلمة المرور
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="كلمة المرور"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "جاري الدخول..."
                  : "تسجيل الدخول"}
              </button>
            </form>

            {message && (
              <div className="mt-5 rounded-xl bg-gray-100 p-4 text-sm text-gray-700">
                {message}
              </div>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 px-6 py-10"
    >
      <div className="mx-auto max-w-md">
        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                TapRate Admin
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {session.user.email}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm transition hover:bg-gray-100"
            >
              خروج
            </button>
          </div>

          <div className="my-8 border-t border-gray-100" />

          <h2 className="text-xl font-bold text-gray-900">
            إضافة مطعم جديد
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            أضف بيانات المطعم لإنشاء صفحته تلقائيًا.
          </p>

          <form
            onSubmit={addRestaurant}
            className="mt-7 space-y-5"
          >
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                اسم المطعم
              </label>

              <input
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="مثال: ساعة لقلبك"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                رابط Google Review
              </label>

              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) =>
                  setGoogleReviewUrl(e.target.value)
                }
                placeholder="https://maps.google.com/..."
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-black"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-black px-5 py-3 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "جاري الإضافة..."
                : "إضافة المطعم"}
            </button>
          </form>

          {message && (
            <div className="mt-6 rounded-xl bg-gray-100 p-4 text-sm text-gray-700">
              {message}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}