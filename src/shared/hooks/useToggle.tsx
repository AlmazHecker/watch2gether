import { useState } from "react";

export const useToggle = (defaultValue: boolean = false) => {
  const [isOpen, setIsOpen] = useState(defaultValue);

  const toggle = (val?: unknown) => {
    return setIsOpen(Boolean(val));
  };
  return { isOpen, toggle };
};
