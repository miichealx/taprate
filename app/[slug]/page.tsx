"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import RestaurantQR from "@/components/RestaurantQR";

type Restaurant = {
  id: number;
  name: string;
  slug: string;
  google_review_url: string | null;
  logo_url: string | null;
};

export default function RestaurantPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [restaurant, setRestaurant] =
    useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRestaurant() {
      if (!slug) {
        return;
      }

      const { data, error: supabaseError } =
        await supabase
          .from("restaurants")
          .select(
            "id, name, slug, google_review_url, logo_url"
          )
          .eq("slug", slug)
          .single();

      if (supabaseError) {
        console.error(
          "SUPABASE ERROR:",
          JSON.stringify(
            supabaseError,
            null,
            2
          )
        );

        setError(supabaseError.message);
        setLoading(false);
        return;
      }

      const restaurantData = data as Restaurant;

      setRestaurant(restaurantData);

      // تسجيل زيارة الصفحة
      const { error: analyticsError } =
        await supabase
          .from("analytics_events")
          .insert({
            restaurant_id: restaurantData.id,
            event_type: "page_view",
            source: "direct",
          });

      if (analyticsError) {
        console.error(
          "ANALYTICS ERROR:",
          analyticsError
        );
      }

      setLoading(false);
    }

    loadRestaurant();
  }, [slug]);

  async function trackGoogleReview() {
    if (!restaurant) {
      return;
    }

    const { error: analyticsError } =
      await supabase
        .from("analytics_events")
        .insert({
          restaurant_id: restaurant.id,
          event_type: "google_review",
          source: "page",
        });

    if (analyticsError) {
      console.error(
        "GOOGLE REVIEW ANALYTICS ERROR:",
        analyticsError
      );
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="flex min-h-screen items-center justify-center bg-[#f5f5f5]"
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
        className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-5"
      >
        <div className="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-3xl">
            ⚠️
          </div>

          <h1 className="mt-6 text-2xl font-black text-gray-900">
            المطعم غير متاح
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            تأكد من صحة الرابط وحاول مرة أخرى.
          </p>
        </div>
      </main>
    );
  }

  const firstLetter =
    restaurant.name.trim().charAt(0) || "T";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-[#f5f5f5] px-4 py-6 sm:px-6 sm:py-10"
    >
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full">
          <div className="overflow-hidden rounded-[36px] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.10)]">
            <div className="px-6 pb-8 pt-8 text-center sm:px-8">

              {/* TapRate */}
              <div className="mb-8 flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[11px] font-black text-white">
                  TR
                </div>

                <span className="text-sm font-bold tracking-wide text-gray-400">
                  TapRate
                </span>
              </div>

              {/* Logo */}
              {restaurant.logo_url ? (
                <img
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  className="mx-auto h-28 w-28 rounded-full object-cover shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
                />
              ) : (
                <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-black text-4xl font-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                  {firstLetter}
                </div>
              )}

              {/* Name */}
              <h1 className="mt-7 text-3xl font-black tracking-tight text-gray-950">
                {restaurant.name}
              </h1>

              <p className="mt-3 text-base font-medium text-gray-500">
                شكرًا لزيارتك ❤️
              </p>

              <p className="mt-1 text-sm text-gray-400">
                رأيك يهمنا ويساعدنا نتحسن
              </p>

              {/* Stars */}
              <div
                className="mt-6 flex justify-center gap-1"
                aria-label="5 stars"
              >
                {Array.from({ length: 5 }).map(
                  (_, index) => (
                    <span
                      key={index}
                      className="text-2xl"
                    >
                      ⭐
                    </span>
                  )
                )}
              </div>

              {/* Google Review */}
              <div className="mt-7 rounded-3xl bg-[#f7f7f7] p-5">
                <p className="text-sm font-bold text-gray-700">
                  هل استمتعت بزيارتك؟
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  شاركنا رأيك على Google
                </p>

                {restaurant.google_review_url ? (
                  <a
                    href={restaurant.google_review_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={trackGoogleReview}
                    className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-4 text-base font-black text-white shadow-lg transition hover:bg-gray-800 active:scale-[0.98]"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-black">
                      G
                    </span>

                    <span>
                      قيّمنا على Google
                    </span>
                  </a>
                ) : (
                  <div className="mt-5 rounded-2xl bg-gray-200 px-5 py-4 text-sm font-bold text-gray-500">
                    رابط التقييم غير متاح
                  </div>
                )}
              </div>

              {/* QR */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <h2 className="text-lg font-black text-gray-900">
                  QR Code الخاص بالمطعم
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  امسح الكود بالكاميرا لفتح صفحة المطعم
                </p>

                <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                  <RestaurantQR
                    slug={restaurant.slug}
                    name={restaurant.name}
                  />
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-100 bg-[#fafafa] px-6 py-6 text-center">
              <p className="text-[11px] font-medium text-gray-400">
                تجربة التقييم الرقمية
              </p>

              <p className="mt-1 text-sm font-black tracking-wide text-gray-800">
                Powered by TapRate
              </p>
            </div>
          </div>

          <p className="mt-5 text-center text-[11px] text-gray-400">
            TapRate • Digital Review Experience
          </p>
        </div>
      </div>
    </main>
  );
}