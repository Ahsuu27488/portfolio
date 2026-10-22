import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Muhammad Ahsan — Software that ships. Websites, AI chatbots, automation";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const monaSans = await readFile(
  join(process.cwd(), "assets/fonts/MonaSans-BlackExpanded.ttf")
);
const hankenGrotesk = await readFile(
  join(process.cwd(), "assets/fonts/HankenGrotesk-Medium.ttf")
);

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          backgroundColor: "#0b100c",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Mona Sans",
            fontWeight: 900,
            fontSize: 64,
            color: "#f0f5f0",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Muhammad Ahsan
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Mona Sans",
              fontWeight: 900,
              fontSize: 132,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: "#f0f5f0",
              marginBottom: 36,
            }}
          >
            <div style={{ display: "flex" }}>Software</div>
            <div style={{ display: "flex" }}>
              <span>that&nbsp;</span>
              <span style={{ color: "#a5ffa0" }}>ships.</span>
            </div>
          </div>

          <div
            style={{
              width: 96,
              height: 12,
              backgroundColor: "#a5ffa0",
              marginBottom: 20,
            }}
          />

          <div
            style={{
              display: "flex",
              fontFamily: "Hanken Grotesk",
              fontWeight: 500,
              fontSize: 36,
              color: "#adb3ae",
              lineHeight: 1,
            }}
          >
            Websites, AI chatbots, automation
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Mona Sans",
          data: monaSans,
          weight: 900,
          style: "normal",
        },
        {
          name: "Hanken Grotesk",
          data: hankenGrotesk,
          weight: 500,
          style: "normal",
        },
      ],
    }
  );
}
