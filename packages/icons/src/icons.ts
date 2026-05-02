import arrowLeftIcon from "../assets/ic/arrow-left.svg";
import bookIcon from "../assets/ic/book.svg";
import scanIcon from "../assets/ic/scan.svg";
import searchIcon from "../assets/ic/search.svg";
import settingsIcon from "../assets/ic/settings.svg";
import type { IconName } from "./icon-names";

export const ICON_SOURCE_BY_NAME = {
  arrowLeft: arrowLeftIcon,
  book: bookIcon,
  scan: scanIcon,
  search: searchIcon,
  settings: settingsIcon,
} satisfies Record<IconName, number>;
