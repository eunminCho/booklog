import { Image } from "expo-image";
import { ICON_SOURCE_BY_TYPE, IconType } from "./constants";

type IconProps = {
  src: IconType;
  size: number;
  color?: string;
};

export function Icon({ src, size, color }: IconProps) {
  return (
    <Image
      source={ICON_SOURCE_BY_TYPE[src]}
      style={{ width: size, height: size, tintColor: color }}
      contentFit="contain"
    />
  );
}
