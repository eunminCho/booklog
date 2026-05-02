import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["localhost", "127.0.0.1"],
  compiler: {
    emotion: true,
  },
  turbopack: {
    rules: {
      "*.svg": {
        loaders: [
          {
            loader: "@svgr/webpack",
            options: {
              dimensions: false,
              expandProps: "end",
              replaceAttrValues: {
                "#0E1011": "currentColor",
              },
            },
          },
        ],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
