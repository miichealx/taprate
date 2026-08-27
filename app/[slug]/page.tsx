"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Restaurant = {
  name: string;
  google_review_url: string;
  logo_url?: string | null;
};

export default function RestaurantPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      const { data, error } = await supabase
        .from("restaurants")
        .select("name, google_review_url, logo_url")
        .eq("slug", slug)
        .single();

      if (error) {
        console.error("SUPABASE ERROR:", error);
        setError(error.message);
        setLoading(false);
        return;
      }

      setRestaurant(data);
      setLoading(false);
    }

    if (slug) {
      loadRestaurant();
    }
  }, [slug]);

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f7f7]"
      >
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          <p className="mt-4 text-sm text-gray-500">
            جاري التحميل...
          </p>
        </div>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f7f7f7] px-6"
      >
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-2xl font-bold text-gray-900">
            المطعم غير متاح
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            تأكد من صحة الرابط وحاول مرة أخرى.
          </p>
        </div>
      </main>
    );
  }

  const firstLetter = restaurant.name.trim().charAt(0);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f7f7f7] px-5 py-8"
    >
      <div className="mx-auto flex min-h-[92vh] max-w-md items-center justify-center">

        <div className="w-full">

          {/* Card */}
          <div className="overflow-hidden rounded-[32px] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

            {/* Top */}
            <div className="px-7 pb-8 pt-10 text-center">

              {/* Logo */}
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="mx-auto h-24 w-24 rounded-full object-cover shadow-lg"
                />
              ) : (
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-3xl font-bold text-white shadow-lg">
                  {firstLetter || "T"}
                </div>
              )}

              {/* Restaurant name */}
              <h1 className="mt-7 text-3xl font-black tracking-tight text-gray-900">
                {restaurant.name}
              </h1>

              <p className="mt-3 text-base text-gray-500">
                شكرًا لزيارتك ❤️
              </p>

              <p className="mt-1 text-sm text-gray-400">
                رأيك يهمنا ويساعدنا نتحسن
              </p>

              {/* Stars */}
              <div
                className="mt-7 flex justify-center gap-1"
                aria-label="5 stars"
              >
                {Array.from({ length: 5 }).map((_, index) => (
                  <span
                    key={index}
                    className="text-3xl"
                  >
                    ⭐
                  </span>
                ))}
              </div>

              {/* Google review */}
              <a
                href={restaurant.google_review_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:scale-[1.01] hover:bg-gray-800 active:scale-[0.98]"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                  G
                </span>

                <span>
                  قيّمنا على Google
                </span>
              </a>

              <p className="mt-4 text-xs leading-5 text-gray-400">
                اضغط على الزر لكتابة تقييمك على Google
              </p>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-100 bg-gray-50 px-7 py-5 text-center">
              <p className="text-xs text-gray-400">
                Powered by
              </p>

              <p className="mt-1 text-sm font-bold tracking-wide text-gray-800">
                TapRate
              </p>
            </div>

          </div>

          {/* Footer */}
          <p className="mt-5 text-center text-xs text-gray-400">
            TapRate • Digital Review Experience
          </p>

        </div>
      </div>
    </main>
  );
}