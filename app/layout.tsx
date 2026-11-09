import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
 title: "Sébastien Rondeau Cameira — Web, mobile & DevOps",
 description: "Le site personnel de Sébastien Rondeau Cameira : développement web et mobile, parcours et projets.",
 icons: {icon: [{url: "/favicon.ico", sizes: "any"}, {url: "/favicon.svg", type: "image/svg+xml"}], shortcut: "/favicon.ico"}
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {return <html lang="fr"><body>{children}</body></html>}
