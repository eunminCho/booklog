"use client";

import styled from "@emotion/styled";

const SkeletonRoot = styled.div(({ theme }) => ({
  borderRadius: theme.radius.md,
  backgroundColor: theme.colors.surface.subtle,
  animation: "booklogPulse 1.4s ease-in-out infinite",
  "@keyframes booklogPulse": {
    "0%": { opacity: 0.35 },
    "50%": { opacity: 0.8 },
    "100%": { opacity: 0.35 },
  },
}));

function Skeleton(props: React.ComponentProps<typeof SkeletonRoot>) {
  return <SkeletonRoot {...props} />;
}

export { Skeleton };
