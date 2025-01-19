"use client";
import * as React from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@ui/button";
import { Input, type InputProps } from "@ui/input";
import { cn } from "@shared/lib/utils";

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("hide-password-toggle pr-10", className)}
        ref={ref}
        {...props}
        endIcon={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeIcon className="h-4 w-4" aria-hidden="true" />
            ) : (
              <EyeOffIcon className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        }
      />
    );
  },
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };

// <style>{`
// 					.hide-password-toggle::-ms-reveal,
// 					.hide-password-toggle::-ms-clear {
// 						visibility: hidden;
// 						pointer-events: none;
// 						display: none;
// 					}
// 				`}</style>
