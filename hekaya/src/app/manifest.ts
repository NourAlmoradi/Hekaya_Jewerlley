import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mashaer Jewellery",
    short_name: "Mashaer",
    description:
      "Premium children's jewellery for the UAE with a private QR Memory keepsake.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf6ef",
    theme_color: "#c9a96e",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
