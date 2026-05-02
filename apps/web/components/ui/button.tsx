"use client";

import Link, { type LinkProps } from "next/link";
import * as React from "react";
import type { CSSObject, Theme } from "@emotion/react";
import styled from "@emotion/styled";

type ButtonVariant = "default" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg";

type ButtonStyleProps = {
  variant: ButtonVariant;
  size: ButtonSize;
  fullWidth: boolean;
};

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

type ButtonLinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> &
  LinkProps & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  };

function resolveButtonStyle({ theme, variant, size, fullWidth }: { theme: Theme } & ButtonStyleProps) {
  const base: CSSObject = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: theme.spacing.sm,
    whiteSpace: "nowrap" as const,
    borderRadius: theme.radius.md,
    border: "1px solid transparent",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s ease",
    textDecoration: "none",
    width: fullWidth ? "100%" : "auto",
  };

  const sizes: Record<ButtonSize, CSSObject> = {
    default: { minHeight: 36, padding: "8px 16px", fontSize: theme.typography.sm },
    sm: { minHeight: 32, padding: "6px 12px", fontSize: theme.typography.xs },
    lg: { minHeight: 40, padding: "10px 24px", fontSize: theme.typography.body },
  };

  const variants: Record<ButtonVariant, CSSObject> = {
    default: {
      backgroundColor: theme.colors.brand.primary,
      color: theme.colors.text.inverse,
      "&:hover": { backgroundColor: theme.colors.surface.subtle },
    },
    outline: {
      backgroundColor: theme.colors.surface.default,
      borderColor: theme.colors.border.subtle,
      color: theme.colors.text.primary,
      "&:hover": { backgroundColor: theme.colors.surface.subtle },
    },
    ghost: {
      backgroundColor: "transparent",
      color: theme.colors.text.primary,
      "&:hover": { backgroundColor: theme.colors.surface.subtle },
    },
  };

  return {
    ...base,
    ...sizes[size],
    ...variants[variant],
    "&:disabled": {
      opacity: 0.6,
      pointerEvents: "none" as const,
    },
  };
}

const shouldForwardButtonProp = (prop: string) => !["variant", "size", "fullWidth"].includes(prop);

const StyledButton = styled("button", { shouldForwardProp: shouldForwardButtonProp })<ButtonStyleProps>(
  resolveButtonStyle,
);

const StyledButtonLink = styled(Link, { shouldForwardProp: shouldForwardButtonProp })<ButtonStyleProps>(
  resolveButtonStyle,
);

function Button({ variant = "default", size = "default", fullWidth = false, ...props }: ButtonProps) {
  return <StyledButton variant={variant} size={size} fullWidth={fullWidth} {...props} />;
}

function ButtonLink({ variant = "default", size = "default", fullWidth = false, ...props }: ButtonLinkProps) {
  return <StyledButtonLink variant={variant} size={size} fullWidth={fullWidth} {...props} />;
}

export { Button, ButtonLink };
