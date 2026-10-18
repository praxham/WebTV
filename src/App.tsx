import { config } from "./config";
import "./index.css";
import Dock from "./components/Dock";
import ClockAndActions from "./components/ClockAndActions";
import { useAppsStore } from "./store";
import { init, setFocus } from "@noriginmedia/norigin-spatial-navigation";
import { useEffect } from "react";
import { Bounce, ToastContainer } from "react-toastify";

init({
  distanceCalculationMethod: "center",
});

export function App() {
  const isDockExpanded = useAppsStore((state) => state.isDockExpanded);
  const focusedApp = useAppsStore((state) => state.focusedApp);
  const focusedAppBG = config.apps.find(
    (app) => app.name === focusedApp,
  )?.backgroundImage;

  useEffect(() => {
    let isFirstInteraction = true;

    const handleFirstInput = (e: KeyboardEvent) => {
      if (!isFirstInteraction) return; // If we already started, ignore entirely

      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

      if (
        arrowKeys.includes(e.key) &&
        document.activeElement === document.body
      ) {
        e.preventDefault();
        isFirstInteraction = false; // Lock it out permanently

        if (e.key === "ArrowUp") {
          setFocus("LOCK");
        } else {
          setFocus("APP_0");
        }
      }
    };

    window.addEventListener("keydown", handleFirstInput);
    return () => window.removeEventListener("keydown", handleFirstInput);
  }, []);

  return (
    <div
      className="flex flex-col w-screen h-screen overflow-hidden duration-300 ease-in-out"
      style={{
        backgroundImage: `url(${focusedAppBG ? focusedAppBG : config.backgroundImage})`,
      }}
    >
      <div
        className={`fixed inset-0 z-0 pointer-events-none bg-black/50 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
          isDockExpanded ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`transition-opacity duration-300 ease-in-out order-2 ${
          isDockExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <ClockAndActions />
      </div>
      <Dock />
      <ToastContainer
        position="top-center"
        hideProgressBar={true}
        closeButton={false}
        autoClose={5000}
        toastClassName="!relative !bg-black/20 text-white! text-bold! !backdrop-blur-2xl !rounded-[32px] !p-6 !w-[380px] !min-h-[200px] !flex !flex-col !justify-center !items-center !text-center !shadow-2xl !border !border-white/10 !pointer-events-auto !m-0"
      />
    </div>
  );
}

export default App;
