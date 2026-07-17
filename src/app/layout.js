import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";
import "./templates.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata = {
  title: "ShubhKalyan - Premium E-Event & Wedding Website Builder",
  description: "Create elegant, custom wedding invitations and e-event websites. Share your special moments with your loved ones.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${greatVibes.variable}`}
    >
      <body>
        {children}
      </body>
    </html>
  );
}
