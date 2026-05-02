import bookIcon from "../../../assets/ic/book.svg";
import scanIcon from "../../../assets/ic/scan.svg";
import settingsIcon from "../../../assets/ic/settings.svg";
import arrowLeftIcon from "../../../assets/ic/arrow-left.svg";

export const ICON_SOURCE_BY_TYPE = {
    book: bookIcon,
    scan: scanIcon,
    settings: settingsIcon,
    arrowLeft: arrowLeftIcon,
  } as const;
  
export type IconType = keyof typeof ICON_SOURCE_BY_TYPE;
  
