import { FC } from "react";
import css from "./scroll-down.module.css";
import { cn } from "@shared/lib/utils";

type ScrollDownProps = {
  className?: string;
};

const ScrollDown: FC<ScrollDownProps> = ({ className }: ScrollDownProps) => {
  return (
    <div className={className}>
      <div className={css.mouse_scroll}>
        <div className={css.mouse}>
          <div className={css.wheel}></div>
        </div>
        <div>
          <span className={cn(css.m_scroll_arrows, css.unu)}></span>
          <span className={cn(css.m_scroll_arrows, css.doi)}></span>
          <span className={cn(css.m_scroll_arrows, css.trei)}></span>
        </div>
      </div>
    </div>
  );
};

export default ScrollDown;
