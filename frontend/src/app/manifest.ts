import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FairFare – Trip Splitter",
    short_name: "FairFare",
    description:
      "End the post-trip who-owes-whom debate with minimum peer-to-peer payments and low-awkwardness Nudge messages.",
    start_url: "/",
    display: "standalone",
    background_color: "#F8F7F4",
    theme_color: "#4A6B5D",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
