import { execute } from "@/functions";
import { useAppsStore } from "@/store";
import type { AppData } from "@/types";
import {
  setFocus,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";

const AppCard = ({
  app,
  index,
  totalApps,
}: {
  app: AppData;
  index: number;
  totalApps: number;
}) => {
  const { focusedApp, updateFocusedApp } = useAppsStore((state) => state);
  const updateIsDockExpanded = useAppsStore(
    (state) => state.updateIsDockExpanded,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { ref, focused } = useFocusable({
    focusKey: `APP_${index}`,
    onEnterPress: () => execute(app.cliCommand, setIsLoading),
    onArrowPress: (direction) => {
      const lastIndex = totalApps - 1;
      const currentRow = Math.floor(index / 6);
      const lastRow = Math.floor(lastIndex / 6);

      switch (direction) {
        case "up":
          if (index < 6) setFocus("LOCK");
          else setFocus(`APP_${index - 6}`);
          break;

        case "down":
          if (currentRow < lastRow) {
            setFocus(`APP_${Math.min(index + 6, lastIndex)}`);
          }
          break;

        case "left":
          setFocus(`APP_${index === 0 ? lastIndex : index - 1}`);
          break;

        case "right":
          setFocus(`APP_${index === lastIndex ? 0 : index + 1}`);
          break;
      }

      return false;
    },
    onFocus: () => {
      if (index < 6) {
        updateIsDockExpanded(false);
      } else {
        updateIsDockExpanded(true);
      }
      updateFocusedApp(app.name as string);
    },
    onBlur: () => {
      updateFocusedApp("");
    },
  });

  useEffect(() => {
    if (!focused || index < 6) return;

    const scroll = () => {
      const el = ref.current as HTMLElement | null;
      const container = el?.closest<HTMLElement>("[data-dock-grid]");
      if (!el || !container) return;

      const pad = 32;
      const c = container.getBoundingClientRect();
      const r = el.getBoundingClientRect();

      if (r.top < c.top + pad) {
        container.scrollBy({ top: r.top - c.top - pad, behavior: "smooth" });
      } else if (r.bottom > c.bottom - pad) {
        container.scrollBy({
          top: r.bottom - c.bottom + pad,
          behavior: "smooth",
        });
      }
    };

    scroll();
    const t = setTimeout(scroll, 350); // re-check after the expand transition
    return () => clearTimeout(t);
  }, [focused, index, ref]);

  return (
    <img
      ref={ref}
      key={index}
      className={`scroll-my-8 rounded-[33.19] transition-all duration-300 ease-in-out w-62.75 h-37.5 ${
        focused ? "outline-white/20 outline scale-125 z-10" : ""
      } ${
        isLoading && focusedApp === app.name
          ? "subtle-bounce pointer-events-none"
          : ""
      }`}
      src={app.image}
      alt={app.name}
      onClick={() => execute(app.cliCommand, setIsLoading)}
    />
  );
};

export default AppCard;
