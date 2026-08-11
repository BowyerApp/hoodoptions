import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "HoodOptions — Defined-risk markets for tokenized stocks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Purpose-built social card. Do not reuse the product hero image here:
 * shared links need a crisp identity, readable name, and a single message.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        tw="flex h-full w-full flex-col justify-between"
        style={{
          backgroundColor: "#090a0d",
          color: "#f1f3f5",
          padding: "62px 70px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div tw="flex items-center">
          <svg width="54" height="54" viewBox="0 0 28 28" fill="none">
            <path
              d="M3 5H13V8H3V5ZM3 12.5H16V15.5H3V12.5ZM3 20H11V23H3V20Z"
              fill="#F1F3F5"
            />
            <path
              d="M16 5H25V8H16V5ZM13 12.5H25V15.5H13V12.5ZM18 20H25V23H18V20Z"
              fill="#F1F3F5"
              fillOpacity="0.42"
            />
          </svg>
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "0.16em",
              marginLeft: 22,
            }}
          >
            HOODOPTIONS
          </div>
        </div>

        <div tw="flex flex-col">
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.03,
              maxWidth: 850,
            }}
          >
            Defined-risk markets for tokenized stocks.
          </div>
          <div
            style={{
              color: "#a98a5b",
              fontSize: 23,
              fontWeight: 600,
              letterSpacing: "0.1em",
              marginTop: 28,
            }}
          >
            MAX LOSS = PREMIUM
          </div>
        </div>

        <div tw="flex items-end justify-between">
          <div
            style={{
              color: "rgba(241,243,245,0.52)",
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.11em",
            }}
          >
            ROBINHOOD CHAIN · USDG LIQUIDITY
          </div>
          <div
            style={{
              color: "rgba(241,243,245,0.68)",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            hoodoptions.xyz
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: -110,
            bottom: -120,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "1px solid rgba(169,138,91,0.18)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -20,
            bottom: -30,
            width: 330,
            height: 330,
            borderRadius: 9999,
            border: "1px solid rgba(169,138,91,0.12)",
          }}
        />
      </div>
    ),
    size
  );
}
