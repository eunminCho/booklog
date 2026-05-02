"use client";

import * as React from "react";
import styled from "@emotion/styled";

const StyledInput = styled.input(({ theme }) => ({
  width: "100%",
  minHeight: 36,
  borderRadius: theme.radius.md,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  color: theme.colors.text.primary,
  padding: "8px 12px",
  fontSize: theme.typography.sm,
  outline: "none",
  transition: "all 0.15s ease",
  "&::placeholder": {
    color: theme.colors.text.muted,
  },
  "&:focus-visible": {
    borderColor: theme.colors.border.default,
    boxShadow: `0 0 0 2px ${theme.colors.surface.subtle}`,
  },
  "&:disabled": {
    opacity: 0.6,
    cursor: "not-allowed",
  },
}));

function Input({ type, ...props }: React.ComponentProps<"input">) {
  return <StyledInput type={type} {...props} />;
}

export { Input };
