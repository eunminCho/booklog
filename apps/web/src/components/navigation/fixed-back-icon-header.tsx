"use client";

import Link from "next/link";
import styled from "@emotion/styled";
import { Icon } from "@/src/components/Icon/Icon";

type FixedBackIconHeaderProps = {
  href: string;
  ariaLabel: string;
};

export function FixedBackIconHeader({ href, ariaLabel }: FixedBackIconHeaderProps) {
  return (
    <HeaderRoot>
      <HeaderInner>
        <BackLink href={href} aria-label={ariaLabel}>
          <Icon name="arrowLeft" size={24} />
        </BackLink>
      </HeaderInner>
    </HeaderRoot>
  );
}

const HeaderRoot = styled.header(({ theme }) => ({
  position: "fixed",
  insetInline: 0,
  top: 0,
  zIndex: 30,
  borderBottom: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.default,
  opacity: 0.95,
  backdropFilter: "blur(8px)",
}));

const HeaderInner = styled.div({
  margin: "0 auto",
  width: "100%",
  maxWidth: 960,
  display: "flex",
  alignItems: "center",
  padding: "12px 24px",
});

const BackLink = styled(Link)(({ theme }) => ({
  display: "inline-flex",
  width: 40,
  height: 40,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: theme.radius.md,
  color: theme.colors.text.primary,
  transition: "background-color 0.15s ease",
  "&:hover": {
    backgroundColor: theme.colors.surface.subtle,
  },
}));
