import { Inter, Playfair_Display, Great_Vibes } from "next/font/google";
import "./globals.css";

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
  title: "ShubhKalyan — Create Your Free Wedding Invitation Website | 120+ Templates",
  description: "Create elegant, custom wedding invitations and e-event websites. Share your special moments with your loved ones.",
  openGraph: {
    title: "ShubhKalyan — Create Your Free Wedding Invitation Website | 120+ Templates",
    description: "Create elegant, custom wedding invitations and e-event websites. Share your special moments with your loved ones.",
    url: "https://www.shubhkalyan.in",
    siteName: "ShubhKalyan",
    images: [
      {
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "ShubhKalyan Wedding Website Builder",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShubhKalyan — Create Your Free Wedding Invitation Website",
    description: "Create elegant, custom wedding invitations and e-event websites. Share your special moments with your loved ones.",
    images: ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80"],
  },
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
