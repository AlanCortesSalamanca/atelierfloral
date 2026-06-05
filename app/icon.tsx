import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 6,
        backgroundColor: "#4b3d35",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2C10 2 6 8 6 11C6 13.2 7.8 15 10 15C12.2 15 14 13.2 14 11C14 8 10 2 10 2Z"
          fill="#c7a56a"
        />
      </svg>
    </div>,
    { ...size },
  );
}
