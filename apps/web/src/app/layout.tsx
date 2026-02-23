import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlyDea - GeoInteligencia Municipal",
  description:
    "SaaS de geointeligencia para gestao territorial, monitoramento ambiental e aprovacao digital de processos.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans`}>
        {process.env.NODE_ENV !== "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function () {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.getRegistrations()
    .then(function (registrations) {
      return Promise.all(registrations.map(function (registration) { return registration.unregister(); }));
    })
    .catch(function () { return undefined; });
  if ("caches" in window) {
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (key) { return key.indexOf("flydea-mobile-") === 0; }).map(function (key) { return caches.delete(key); }));
      })
      .catch(function () { return undefined; });
  }
})();`,
            }}
          />
        ) : null}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
