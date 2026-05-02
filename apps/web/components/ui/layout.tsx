"use client";

import styled from "@emotion/styled";
import type { CSSProperties, ReactNode } from "react";

type StackProps = {
  children: ReactNode;
  gap?: number;
  style?: CSSProperties;
};

type InlineProps = {
  children: ReactNode;
  gap?: number;
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: boolean;
  style?: CSSProperties;
};

const Page = styled.main(({ theme }) => ({
  minHeight: "100vh",
  backgroundColor: theme.colors.surface.canvas,
  padding: "40px 24px",
}));

const Container = styled.div({
  width: "100%",
  maxWidth: 960,
  margin: "0 auto",
});

const Surface = styled.section(({ theme }) => ({
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  boxShadow: theme.shadow.sm,
  padding: theme.spacing.xl,
}));

function Stack({ children, gap = 12, style }: StackProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {children}
    </div>
  );
}

function Inline({ children, gap = 12, align = "center", justify = "flex-start", wrap = false, style }: InlineProps) {
  return (
    <div
      style={{
        display: "flex",
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export { Container, Inline, Page, Stack, Surface };
