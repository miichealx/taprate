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
        const url = window.location.origin + "/" + slug;

        const qrImage = await QRCode.toDataURL(url, {
          width: 1000,
          margin: 4,
          errorCorrectionLevel: "H",
        });

        setQr(qrImage);
      } catch (error) {
        console.error("QR ERROR:", error);
      }
    }

    generateQR();
  }, [slug]);

  function downloadQR() {
    if (!qr) return;

    const link = document.createElement("a");
    link.href = qr;
    link.download = slug + "-QR.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

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
    <div className="flex w-full flex-col items-center">
      <div className="rounded-3xl bg-white p-5 shadow-lg">
        <img
          src={qr}
          alt={"QR Code - " + name}
          className="h-64 w-64"
        />
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        امسح الكود لفتح صفحة {name}
      </p>

      <button
        type="button"
        onClick={downloadQR}
        className="mt-5 w-full rounded-2xl bg-black px-6 py-4 text-base font-bold text-white shadow-lg hover:bg-gray-800"
      >
        تحميل QR Code
      </button>

      <p className="mt-3 text-xs text-gray-400">
        سيتم حفظ الكود كصورة PNG
      </p>
    </div>
  );
}