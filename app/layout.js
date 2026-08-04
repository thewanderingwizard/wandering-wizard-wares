import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL("https://www.wanderingwizardwares.com"),
  title: "Wandering Wizard Wares | Books, Curios, Oddities & Ephemera",
  description:
    "A menagerie of the magical and the mundane: books, curios, oddities, and ephemera curated by the Wandering Wizard.",
  openGraph: {
    title: "Wandering Wizard Wares",
    description:
      "Books, curios, oddities, and ephemera—magically resonant or beautifully mundane.",
    url: "https://www.wanderingwizardwares.com",
    siteName: "Wandering Wizard Wares",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${sans.variable}`}>
        {children}
      </body>
    </html>
  );
}
