"use client";

const googleReviewsUrl =
  "https://www.google.com/maps/place/%D8%B3%D9%8A+%D8%B9%D9%85%D8%B1+%D9%83%D8%A7%D9%81%D9%8A%D8%A9%E2%80%AD/@30.0621204,31.3390365,17z/data=!4m8!3m7!1s0x14583f0335802f7f:0x3271c4c7b9a9fa5a!8m2!3d30.0621158!4d31.3364616!9m1!1b1!16s%2Fg%2F11vfb2t0vs?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D";

export default function Home() {
  function openGoogleReviews() {
    window.open(googleReviewsUrl, "_blank");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto flex min-h-[90vh] max-w-md items-center justify-center">
        <div className="w-full rounded-3xl bg-white p-8 text-center shadow-xl">

          {/* Logo */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-black text-2xl font-bold text-white">
            TR
          </div>

          {/* Restaurant */}
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            سي عمر كافية
          </h1>

          <p className="mt-3 text-gray-500">
            استمتع بزيارتك؟
          </p>

          <p className="mt-1 text-gray-500">
            شاركنا تقييمك على Google ⭐
          </p>

          {/* Stars */}
          <div className="mt-7 flex justify-center gap-1 text-4xl">
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
            <span>⭐</span>
          </div>

          {/* Google Button */}
          <button
            onClick={openGoogleReviews}
            className="mt-8 w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold text-white transition hover:bg-gray-800 active:scale-[0.98]"
          >
            ⭐ اكتب تقييمك على Google
          </button>

          <p className="mt-6 text-sm text-gray-400">
            TapRate
          </p>
        </div>
      </div>
    </main>
  );
}