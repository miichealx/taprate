"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

type Restaurant = {
  name: string;
  google_review_url: string;
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
        .select("name, google_review_url")
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
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-bold text-red-600">
            Restaurant is not available
          </h1>

          <p className="mt-3 text-sm text-gray-500">
            {error || "Restaurant not found"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl">

          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
            TR
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {restaurant.name}
          </h1>

          <p className="mt-3 text-gray-500">
            استمتعت بزيارتك؟
          </p>

          <p className="mt-1 text-gray-500">
            شاركنا تقييمك على Google ⭐
          </p>

          <div className="mt-7 flex justify-center gap-1 text-4xl">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>

          <a
            href={restaurant.google_review_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white"
          >
            ⭐ اكتب تقييمك على Google
          </a>

          <p className="mt-6 text-sm text-gray-400">
            Powered by TapRate
          </p>
        </div>
      </div>
    </main>
  );
}