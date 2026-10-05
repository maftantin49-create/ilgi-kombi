import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Birden fazla package-lock.json algılandığında Turbopack yanlış workspace root
    // kullanıyor; Server Action bundle'ları compile edilemiyor → "Connection closed." 500.
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "gmgzexejsxluysgkqvqr.supabase.co" },
      { protocol: "https", hostname: "ilgikombiyedekparca.com" },
    ],
  },
  experimental: {
    serverActions: {
      // xlsx FormData gerçek ölçüm: 10k rows ≈ 8 MB (OOXML XML overhead + shared strings)
      // UI hard limit: 9.5 MB → server 10 MB — kullanıcı asla 413 almaz
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
