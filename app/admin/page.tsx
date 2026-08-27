
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  id: number;
  name: string;
  slug: string;
  google_review_url: string | null;
  logo_url: string | null;
  created_at: string;
};

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [name, setName] = useState("");
  const [googleUrl, setGoogleUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editGoogleUrl, setEditGoogleUrl] = useState("");
  const [editLogoUrl, setEditLogoUrl] = useState("");

  useEffect(() => {
    checkSession();

    const { data } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => {
        setSession(currentSession);

        if (currentSession) {
          loadRestaurants();
        } else {
          setRestaurants([]);
        }
      }
    );

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function checkSession() {
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    setSession(currentSession);
    setAuthLoading(false);

    if (currentSession) {
      await loadRestaurants();
    }
  }

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      console.error("LOGIN ERROR:", error);
      setMessage("خطأ: " + error.message);
      return;
    }

    setMessage("تم تسجيل الدخول بنجاح");
  }

  async function logout() {
    await supabase.auth.signOut();

    setSession(null);
    setRestaurants([]);
    setMessage("");
  }

  async function loadRestaurants() {
    const { data, error } = await supabase
      .from("restaurants")
      .select(
        "id, name, slug, google_review_url, logo_url, created_at"
      )
      .order("id", { ascending: false });

    if (error) {
      console.error("LOAD ERROR:", error);
      setMessage("خطأ في تحميل المطاعم: " + error.message);
      return;
    }

    setRestaurants((data || []) as Restaurant[]);
  }

  async function addRestaurant(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const cleanName = name.trim();
    const cleanGoogleUrl = googleUrl.trim();
    const cleanLogoUrl = logoUrl.trim();

    if (!cleanName) {
      setMessage("اكتب اسم المطعم");
      setLoading(false);
      return;
    }

    if (!cleanGoogleUrl) {
      setMessage("اكتب رابط Google Review");
      setLoading(false);
      return;
    }

    const insertData: {
      name: string;
      google_review_url: string;
      logo_url?: string;
    } = {
      name: cleanName,
      google_review_url: cleanGoogleUrl,
    };

    if (cleanLogoUrl) {
      insertData.logo_url = cleanLogoUrl;
    }

    const { data, error } = await supabase
      .from("restaurants")
      .insert(insertData)
      .select(
        "id, name, slug, google_review_url, logo_url, created_at"
      )
      .single();

    if (error) {
      console.error("ADD ERROR:", error);
      setMessage("خطأ: " + error.message);
      setLoading(false);
      return;
    }

    setName("");
    setGoogleUrl("");
    setLogoUrl("");

    setMessage(
      "تم إضافة " + data.name + " بنجاح - الرابط: /" + data.slug
    );

    await loadRestaurants();

    setLoading(false);
  }

  function startEdit(restaurant: Restaurant) {
    setEditingId(restaurant.id);
    setEditName(restaurant.name);
    setEditGoogleUrl(restaurant.google_review_url || "");
    setEditLogoUrl(restaurant.logo_url || "");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditGoogleUrl("");
    setEditLogoUrl("");
  }

  async function updateRestaurant(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (editingId === null) {
      return;
    }

    setLoading(true);
    setMessage("");

    const cleanName = editName.trim();
    const cleanGoogleUrl = editGoogleUrl.trim();
    const cleanLogoUrl = editLogoUrl.trim();

    if (!cleanName) {
      setMessage("اكتب اسم المطعم");
      setLoading(false);
      return;
    }

    if (!cleanGoogleUrl) {
      setMessage("اكتب رابط Google Review");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("restaurants")
      .update({
        name: cleanName,
        google_review_url: cleanGoogleUrl,
        logo_url: cleanLogoUrl || null,
      })
      .eq("id", editingId)
      .select(
        "id, name, slug, google_review_url, logo_url, created_at"
      )
      .single();

    if (error) {
      console.error("UPDATE ERROR:", error);
      setMessage("خطأ في التعديل: " + error.message);
      setLoading(false);
      return;
    }

    setMessage("تم تعديل " + data.name + " بنجاح");

    cancelEdit();
    await loadRestaurants();

    setLoading(false);
  }

  async function deleteRestaurant(
    id: number,
    restaurantName: string
  ) {
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف " + restaurantName + "؟"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("restaurants")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE ERROR:", error);
      setMessage("خطأ في الحذف: " + error.message);
      setLoading(false);
      return;
    }

    if (editingId === id) {
      cancelEdit();
    }

    setMessage("تم حذف " + restaurantName + " بنجاح");

    await loadRestaurants();

    setLoading(false);
  }

  async function copyLink(slug: string) {
    const url = window.location.origin + "/" + slug;

    try {
      await navigator.clipboard.writeText(url);
      setMessage("تم نسخ الرابط بنجاح");

      setTimeout(() => {
        setMessage("");
      }, 2000);
    } catch (error) {
      console.error("COPY ERROR:", error);
      setMessage("لم يتم نسخ الرابط");
    }
  }

  async function downloadQR(slug: string) {
    try {
      const QRCode = await import("qrcode");

      const url = window.location.origin + "/" + slug;

      const qr = await QRCode.toDataURL(url, {
        width: 1200,
        margin: 4,
        errorCorrectionLevel: "H",
      });

      const link = document.createElement("a");

      link.href = qr;
      link.download = slug + "-QR.png";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("QR ERROR:", error);
      alert("حدث خطأ أثناء تحميل QR");
    }
  }

  const filteredRestaurants = restaurants.filter(
    (restaurant) => {
      const text = search.trim().toLowerCase();

      if (!text) {
        return true;
      }

      return (
        restaurant.name.toLowerCase().includes(text) ||
        restaurant.slug.toLowerCase().includes(text)
      );
    }
  );

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">جاري التحميل...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-gray-50 px-5 py-10"
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
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-gray-700">
                  كلمة المرور
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="كلمة المرور"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading
                  ? "جاري الدخول..."
                  : "تسجيل الدخول"}
              </button>

            </form>

            {message && (
              <div className="mt-5 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-700">
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
      className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-10"
    >
      <div className="mx-auto max-w-6xl">

        <div className="rounded-3xl bg-white p-6 shadow-xl">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black font-bold text-white">
                  TR
                </div>

                <div>
                  <h1 className="text-2xl font-black text-gray-900">
                    TapRate
                  </h1>

                  <p className="text-sm text-gray-500">
                    لوحة تحكم المطاعم
                  </p>
                </div>

              </div>

              <p className="mt-3 text-sm text-gray-400">
                {session.user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-bold hover:bg-gray-100"
            >
              تسجيل الخروج
            </button>

          </div>

        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">

          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <p className="text-sm text-gray-500">
              إجمالي المطاعم
            </p>

            <p className="mt-2 text-4xl font-black text-gray-900">
              {restaurants.length}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              مطعم مسجل
            </p>
          </div>

          <div className="rounded-3xl bg-black p-6 text-white shadow-lg">
            <p className="text-sm text-gray-300">
              نتائج البحث
            </p>

            <p className="mt-2 text-4xl font-black">
              {filteredRestaurants.length}
            </p>

            <p className="mt-2 text-xs text-gray-400">
              مطعم ظاهر
            </p>
          </div>

        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8">

          {editingId !== null ? (
            <>
              <div className="flex items-center justify-between gap-4">

                <div>
                  <h2 className="text-xl font-black text-gray-900">
                    تعديل المطعم
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    تعديل بيانات المطعم
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-100"
                >
                  إلغاء
                </button>

              </div>

              <form
                onSubmit={updateRestaurant}
                className="mt-7 space-y-5"
              >

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    اسم المطعم
                  </label>

                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    رابط Google Review
                  </label>

                  <input
                    type="url"
                    value={editGoogleUrl}
                    onChange={(e) =>
                      setEditGoogleUrl(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    رابط اللوجو
                  </label>

                  <input
                    type="url"
                    value={editLogoUrl}
                    onChange={(e) => setEditLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading
                    ? "جاري الحفظ..."
                    : "حفظ التعديلات"}
                </button>

              </form>
            </>
          ) : (
            <>
              <h2 className="text-xl font-black text-gray-900">
                إضافة مطعم جديد
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                أضف بيانات المطعم لإنشاء صفحته.
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
                    onChange={(e) => setName(e.target.value)}
                    placeholder="مثال: روقة"
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    رابط Google Review
                  </label>

                  <input
                    type="url"
                    value={googleUrl}
                    onChange={(e) => setGoogleUrl(e.target.value)}
                    placeholder="https://maps.app.goo.gl/..."
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium text-gray-700">
                    رابط اللوجو
                  </label>

                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-black px-5 py-3 font-bold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading
                    ? "جاري الإضافة..."
                    : "إضافة المطعم"}
                </button>

              </form>
            </>
          )}

          {message && (
            <div className="mt-6 rounded-xl bg-gray-100 p-4 text-center text-sm text-gray-700">
              {message}
            </div>
          )}

        </div>

        <div className="mt-6 rounded-3xl bg-white p-6 shadow-xl sm:p-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-xl font-black text-gray-900">
                المطاعم
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                إدارة المطاعم الموجودة
              </p>
            </div>

            <div className="flex gap-2">

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث..."
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black sm:w-64"
              />

              <button
                type="button"
                onClick={loadRestaurants}
                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold hover:bg-gray-100"
              >
                تحديث
              </button>

            </div>

          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-2xl">
                🔍
              </div>

              <p className="mt-4 font-bold text-gray-700">
                لا توجد مطاعم
              </p>

            </div>
          ) : (
            <div className="mt-7 space-y-4">

              {filteredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="rounded-2xl border border-gray-200 p-5"
                >

                  <div className="flex flex-col gap-5">

                    <div className="flex items-center gap-4">

                      {restaurant.logo_url ? (
                        <img
                          src={restaurant.logo_url}
                          alt={restaurant.name}
                          className="h-16 w-16 rounded-2xl object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-black text-xl font-black text-white">
                          {restaurant.name
                            .trim()
                            .charAt(0) || "T"}
                        </div>
                      )}

                      <div className="min-w-0">

                        <h3 className="text-lg font-black text-gray-900">
                          {restaurant.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          /{restaurant.slug}
                        </p>

                      </div>

                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">

                      <a
                        href={"/" + restaurant.slug}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-black px-3 py-3 text-center text-xs font-bold text-white hover:bg-gray-800"
                      >
                        فتح الصفحة
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          copyLink(restaurant.slug)
                        }
                        className="rounded-xl border border-gray-300 px-3 py-3 text-xs font-bold hover:bg-gray-100"
                      >
                        نسخ الرابط
                      </button>

                      <a
                        href={restaurant.google_review_url || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl border border-gray-300 px-3 py-3 text-center text-xs font-bold hover:bg-gray-100"
                      >
                        Google
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          downloadQR(restaurant.slug)
                        }
                        className="rounded-xl border border-gray-300 px-3 py-3 text-xs font-bold hover:bg-gray-100"
                      >
                        تحميل QR
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          startEdit(restaurant)
                        }
                        className="rounded-xl border border-gray-300 px-3 py-3 text-xs font-bold hover:bg-gray-100"
                      >
                        تعديل
                      </button>

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          deleteRestaurant(
                            restaurant.id,
                            restaurant.name
                          )
                        }
                        className="rounded-xl bg-red-50 px-3 py-3 text-xs font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                      >
                        حذف
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          TapRate • Digital Review Experience
        </p>

      </div>
    </main>
  );
}

