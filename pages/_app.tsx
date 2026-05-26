import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider, theme } from "antd";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#7c5e3c",
          borderRadius: 6,
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
