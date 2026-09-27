import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // превью видео SwingVision
    remotePatterns: [new URL("https://api.swing.tennis/matches/thumbnail/**")],
  },
  serverExternalPackages: ["exceljs"],
};

export default nextConfig;
