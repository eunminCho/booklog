"use client";

import * as React from "react";
import styled from "@emotion/styled";

type CardProps = React.ComponentProps<typeof CardRoot>;
type CardSectionProps = React.ComponentProps<typeof CardSection>;

const CardRoot = styled.div(({ theme }) => ({
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  boxShadow: theme.shadow.sm,
}));

const CardSection = styled.div(({ theme }) => ({
  padding: theme.spacing.xl,
}));

function Card({ ...props }: CardProps) {
  return <CardRoot {...props} />;
}

function CardHeader({ ...props }: CardSectionProps) {
  return (
    <CardSection
      style={{ display: "flex", flexDirection: "column", gap: 6 }}
      {...props}
    />
  );
}

function CardTitle({ ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.2, letterSpacing: "-0.01em" }}
      {...props}
    />
  );
}

function CardDescription({ ...props }: React.ComponentProps<"p">) {
  return <p style={{ margin: 0, fontSize: "0.875rem" }} {...props} />;
}

function CardContent({ style, ...props }: React.ComponentProps<"div">) {
  return <CardSection style={{ paddingTop: 0, ...style }} {...props} />;
}

function CardFooter({ style, ...props }: React.ComponentProps<"div">) {
  return (
    <CardSection
      style={{ paddingTop: 0, display: "flex", alignItems: "center", ...style }}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
