"use client";

import type { IconName } from "@booklog/icons";
import { WEB_ICON_COMPONENT_BY_NAME } from "@booklog/icons/web";

type IconProps = {
  name: IconName;
  size: number;
};

export function Icon({ name, size }: IconProps) {
  const SvgIcon = WEB_ICON_COMPONENT_BY_NAME[name];

  return <SvgIcon style={{ width: size, height: size }} />;
}
