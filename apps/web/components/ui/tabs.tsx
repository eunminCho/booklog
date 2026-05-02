"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import styled from "@emotion/styled";

const TabsRoot = styled(TabsPrimitive.Root)({
  display: "flex",
  flexDirection: "column",
  gap: 8,
});

const TabsListRoot = styled(TabsPrimitive.List)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 36,
  borderRadius: theme.radius.lg,
  border: `1px solid ${theme.colors.border.subtle}`,
  backgroundColor: theme.colors.surface.subtle,
  padding: 4,
  color: theme.colors.text.secondary,
}));

const TabsTriggerRoot = styled(TabsPrimitive.Trigger)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  borderRadius: theme.radius.md,
  padding: "6px 12px",
  fontSize: theme.typography.sm,
  fontWeight: 600,
  color: theme.colors.text.secondary,
  border: "none",
  backgroundColor: "transparent",
  transition: "all 0.15s ease",
  "&[data-state='active']": {
    backgroundColor: theme.colors.surface.default,
    color: theme.colors.text.primary,
    boxShadow: theme.shadow.sm,
  },
  "&:focus-visible": {
    outline: "none",
    boxShadow: `0 0 0 2px ${theme.colors.surface.selected}`,
  },
  "&:disabled": {
    opacity: 0.5,
    pointerEvents: "none",
  },
}));

const TabsContentRoot = styled(TabsPrimitive.Content)(({ theme }) => ({
  "&:focus-visible": {
    outline: "none",
    boxShadow: `0 0 0 2px ${theme.colors.surface.selected}`,
  },
}));

function Tabs(props: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsRoot {...props} />;
}

function TabsList(props: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsListRoot {...props} />;
}

function TabsTrigger(props: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return <TabsTriggerRoot {...props} />;
}

function TabsContent(props: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsContentRoot {...props} />;
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
