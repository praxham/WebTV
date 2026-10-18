import { create } from "zustand";

type AppsStore = {
  isDockExpanded: boolean;
  focusedApp: string;
  updateIsDockExpanded: (val: boolean) => void;
  updateFocusedApp: (val: string) => void;
};

export const useAppsStore = create<AppsStore>((set) => ({
  isDockExpanded: false,
  focusedApp: "",
  updateIsDockExpanded: (val) => set({ isDockExpanded: val }),
  updateFocusedApp: (val) => set({ focusedApp: val }),
}));
