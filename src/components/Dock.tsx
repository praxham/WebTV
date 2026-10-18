import { config } from "@/config";
import { useAppsStore } from "@/store";
import type { AppData } from "@/types";
import AppCard from "./AppCard";
import { useEffect, useRef } from "react";

const Dock = () => {
  const isDockExpanded = useAppsStore((state) => state.isDockExpanded);
  const apps = config.apps as AppData[];
  const firstSix = apps.slice(0, 6);
  const gridRef = useRef<HTMLDivElement>(null);

  // const testApps = apps;
  const testApps = Array(50).fill(firstSix).flat();

  const otherAppsCount = testApps.length > 6 ? testApps.length - 6 : 0;
  const extraRowsCount = Math.ceil(otherAppsCount / 6);

  function calculateMargin(extraRows: number) {
    if (extraRows <= 0) return 0;
    // The first extra row adds exactly 150px (the height of the h-37.5 icon)
    // Every subsequent row adds 198px (150px icon height + 48px gap-y-12)
    return 150 + (extraRows - 1) * 198;
  }

  const marginBottomAmount = calculateMargin(extraRowsCount);

  useEffect(() => {
    if (isDockExpanded) return;
    let node: HTMLElement | null = gridRef.current;
    while (node) {
      node.scrollTop = 0;
      node.scrollLeft = 0;
      node = node.parentElement;
    }
  }, [isDockExpanded]);
  // useEffect(() => {
  //   if (!isDockExpanded) {
  //     gridRef.current?.scrollTo({ top: 0, behavior: "auto" });
  //     document.documentElement.scrollTo(0, 0);
  //     document.body.scrollTo(0, 0);
  //   }
  // }, [isDockExpanded]);

  return (
    <div
      className="relative z-10 pt-15 px-22.5 flex flex-col min-h-0"
      style={{
        marginTop: isDockExpanded ? 0 : "auto",
        flex: isDockExpanded ? "1 1 0%" : "0 0 auto",
        paddingBottom: isDockExpanded ? "60px" : 0,
        backgroundColor: isDockExpanded ? "rgba(0, 0, 0, 0.5)" : "transparent",
        backdropFilter: isDockExpanded ? "blur(12px)" : "none",
        WebkitBackdropFilter: isDockExpanded ? "blur(12px)" : "none",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <div className="p-6 bg-gray-950/40 rounded-[65px] border-white/20 border grid grid-cols-6 gap-x-10.5">
        {testApps.slice(0, 6).map((app, index) => (
          <AppCard
            key={`dock-${index}`}
            app={app}
            index={index}
            totalApps={testApps.length}
          />
        ))}
      </div>
      <div
        ref={gridRef}
        data-dock-grid
        className="p-8 grid grid-cols-6 gap-x-10.5 gap-y-12 flex-1 min-h-0 overflow-y-auto transition-all duration-500 ease-in-out"
        style={{
          marginBottom: isDockExpanded ? "0px" : `-${marginBottomAmount}px`,
        }}
      >
        {testApps.slice(6).map((app, index) => {
          const absoluteIndex = index + 6;
          return (
            <AppCard
              key={`grid-${absoluteIndex}`}
              app={app}
              index={absoluteIndex}
              totalApps={testApps.length}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Dock;
