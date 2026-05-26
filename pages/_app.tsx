import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ConfigProvider, theme } from "antd";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#78350f",
          borderRadius: 6,
        },
      }}
    >
      <Component {...pageProps} />
    </ConfigProvider>
  );
}
