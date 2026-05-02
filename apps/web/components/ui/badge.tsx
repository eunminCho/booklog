"use client";

import * as React from "react";
import styled from "@emotion/styled";

type BadgeVariant = "default" | "secondary";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

function Badge({ className, variant, ...props }: BadgeProps) {
  return <BadgeRoot className={className} variant={variant ?? "default"} {...props} />;
}

const BadgeRoot = styled.span<{ variant: BadgeVariant }>(({ theme, variant }) => ({
  display: "inline-flex",
  alignItems: "center",
  borderRadius: theme.radius.full,
  border: `1px solid ${variant === "default" ? theme.colors.border.default : theme.colors.border.subtle}`,
  backgroundColor: variant === "default" ? theme.colors.surface.subtle : theme.colors.surface.default,
  color: variant === "default" ? theme.colors.text.primary : theme.colors.text.secondary,
  padding: "2px 10px",
  fontSize: theme.typography.xs,
  fontWeight: 600,
}));

export { Badge };
