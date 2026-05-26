import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { ConfigProvider, theme } from "antd";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        // Token overrides aim Antd primitives (mainly Select, since the rest
        // are being replaced) at the same palette + radii the custom UI uses.
        token: {
          colorPrimary: "#92400E", // amber-800
          colorBorder: "#E7E5E4", // stone-200
          colorBgContainer: "#FFFFFF",
          borderRadius: 6,
          controlHeight: 36,
          fontFamily: `var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`,
        },
      }}
    >
      <div className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
    </ConfigProvider>
  );
}
