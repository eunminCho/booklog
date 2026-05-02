"use client";

import { useTheme } from "@emotion/react";
import React from "react";
import type { CSSProperties, ReactNode } from "react";

type TextTone = "primary" | "secondary" | "muted" | "inverse" | "error";
type TextSize = "xs" | "sm" | "md" | "lg" | "xl";

type TextProps = {
  children: ReactNode;
  as?: "p" | "span" | "strong" | "label";
  tone?: TextTone;
  size?: TextSize;
  weight?: 400 | 500 | 600 | 700;
  style?: CSSProperties;
};

const sizeMap: Record<TextSize, string> = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
};

const weightMap: Record<NonNullable<TextProps["weight"]>, number> = {
  400: 400,
  500: 500,
  600: 600,
  700: 700,
};

function Text({ as = "p", tone = "primary", size = "md", weight = 400, style, children }: TextProps) {
  const theme = useTheme();
  const color =
    tone === "secondary"
      ? theme.colors.text.secondary
      : tone === "muted"
        ? theme.colors.text.muted
        : tone === "inverse"
          ? theme.colors.text.inverse
          : tone === "error"
            ? theme.colors.feedback.error
            : theme.colors.text.primary;

  return React.createElement(
    as,
    {
      style: {
        margin: 0,
        fontSize: sizeMap[size],
        fontWeight: weightMap[weight],
        color,
        ...style,
      },
    },
    children,
  );
}

type HeadingProps = {
  children: ReactNode;
  level?: 1 | 2 | 3;
  style?: CSSProperties;
};

function Heading({ level = 1, style, children }: HeadingProps) {
  return React.createElement(
    `h${level}`,
    {
      style: {
        margin: 0,
        fontWeight: 700,
        lineHeight: 1.2,
        fontSize: level === 1 ? "1.75rem" : level === 2 ? "1.35rem" : "1.1rem",
        ...style,
      },
    },
    children,
  );
}

export { Heading, Text };
