"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type RestaurantQRProps = {
  slug: string;
  name: string;
};

export default function RestaurantQR({
  slug,
  name,
}: RestaurantQRProps) {
  const [qr, setQr] = useState("");

  useEffect(() => {
    async function generateQR() {
      try {
        const restaurantUrl =
          `${window.location.origin}/${slug}`;

        const dataUrl = await QRCode.toDataURL(
          restaurantUrl,
          {
            width: 400,
            margin: 2,
            errorCorrectionLevel: "H",
          }
        );

        setQr(dataUrl);
      } catch (error) {
        console.error("QR ERROR:", error);
      }
    }

    generateQR();
  }, [slug]);

  if (!qr) {
    return (
      <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl bg-gray-100">
        <span className="text-sm text-gray-400">
          جاري إنشاء QR...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">

      <div className="rounded-3xl bg-white p-5 shadow-lg">
        <img
          src={qr}
          alt={`QR Code - ${name}`}
          className="h-64 w-64"
        />
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        امسح الكود لفتح صفحة {name}
      </p>

    </div>
  );
}