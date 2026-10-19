import { execute } from "@/functions";
import config from "../../public/config.json";
import {
  setFocus,
  useFocusable,
} from "@noriginmedia/norigin-spatial-navigation";
import { useEffect, useState } from "react";

const ACTION_KEYS = ["LOCK", "CLOSE"];

const ActionButton = ({
  command,
  focusKey,
  children,
}: {
  command: string;
  focusKey: string;
  children: React.ReactNode;
}) => {
  const run = () => {
    if (command === "CLOSE") {
      fetch("/api/kill-standalone").catch((err) =>
        console.error("Failed to kill standalone:", err),
      );
    } else {
      execute(command);
    }
  };
  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: run,
    onArrowPress: (direction) => {
      const i = ACTION_KEYS.indexOf(focusKey);

      switch (direction) {
        case "left":
          if (i > 0) setFocus(ACTION_KEYS[i - 1] as string);
          break;
        case "right":
          if (i < ACTION_KEYS.length - 1)
            setFocus(ACTION_KEYS[i + 1] as string);
          break;
        case "down":
          setFocus("APP_0");
          break;
      }

      return false;
    },
  });

  return (
    <button
      ref={ref}
      className={`transition-all duration-300 ease-in-out ${
        focused ? "outline-white/20 outline scale-125" : ""
      }`}
      onClick={run}
    >
      {children}
    </button>
  );
};

const ClockAndActions = () => {
  const [time, setTime] = useState(() => getFormatedTime(new Date()));

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getFormatedTime(new Date()));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed h-max-[62px] top-15 right-22.5 px-4.5 py-4 bg-gray-950/40 rounded-[65px] border-white/20 border font-semibold text-white flex flex-row gap-2 items-center">
      <span className="mt-1">{time}</span>

      <ActionButton focusKey="LOCK" command={config.lockCommand}>
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          ></path>
        </svg>
      </ActionButton>

      <ActionButton focusKey="CLOSE" command={"CLOSE"}>
        <svg
          width="18px"
          height="18px"
          viewBox="0 0 24 24"
          fill="#ffffff"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.6,4.2c-0.5-0.3-1.1-0.1-1.4,0.4c-0.3,0.5-0.1,1.1,0.4,1.4c2.1,1.3,3.5,3.6,3.5,6c0,3.9-3.1,7-7,7s-7-3.1-7-7 c0-2.5,1.4-4.8,3.5-6.1C9,5.6,9.2,5,8.9,4.6C8.6,4.1,8,3.9,7.5,4.2C4.7,5.8,3,8.8,3,12c0,5,4,9,9,9s9-4,9-9 C21,8.8,19.3,5.9,16.6,4.2z"></path>
          <path d="M12,13c0.6,0,1-0.4,1-1V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v9C11,12.6,11.4,13,12,13z"></path>
        </svg>
      </ActionButton>
    </div>
  );
};

const getFormatedTime = (date: Date) => {
  const hours24 = date.getHours();
  const displayHours = hours24 % 12 || 12;
  const period = hours24 < 12 ? "AM" : "PM";
  const paddedMinutes = date.getMinutes().toString().padStart(2, "0");

  return `${displayHours}:${paddedMinutes} ${period}`;
};

export default ClockAndActions;
