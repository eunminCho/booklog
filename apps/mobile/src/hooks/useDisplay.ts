import { useContext } from "react";

import { DisplayContext } from "../state/displayContext/DisplayContext";

export function useDisplay() {
  const context = useContext(DisplayContext);
  if (!context) {
    throw new Error("useDisplay must be used within DisplayProvider");
  }

  return context;
}
