import * as React from "react";

import { cn } from "@shared/lib/utils";
import { type ReactNode } from "react";

export type InputProps = React.ComponentProps<"input"> & {
  label?: string;
  error?: Record<string, string>;
  containerClassName?: string;
  endIcon?: ReactNode;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, containerClassName = "", label, error, endIcon, ...props },
    ref
  ) => {
    return (
      <div className={cn("relative", containerClassName)}>
        {label && (
          <label className="inline-block mb-0.5 text-sm">{label}</label>
        )}
        <div className="relative">
          <input
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
              className
            )}
            ref={ref}
            {...props}
          />
          {endIcon}
        </div>
        {error && <p className="text-sm text-red-500">{error?.message}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
