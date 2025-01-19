import { ComponentProps, FC, ReactNode } from "react";
import NextLink from "next/link";
import { buttonVariants } from "@ui/button";
import { VariantProps } from "class-variance-authority";
import { cn } from "@shared/lib/utils";

type LinkProps = ComponentProps<typeof NextLink> & {
  variant: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
  children: ReactNode;
};

export const Link: FC<LinkProps> = ({ variant, size, className, ...props }) => {
  return (
    <NextLink
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
};
