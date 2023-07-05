import { persist } from "zustand/middleware";
import { UserState, Role } from "../types";
import { create } from "zustand";

// User Store
export const useUserStore = create(
  persist<UserState>(
    (set) => ({
      username: "",
      password: "",
      role: "",
      setUsername: (username: string) =>
        set((state: UserState) => ({ ...state, username })),
      setPassword: (password: string) =>
        set((state: UserState) => ({ ...state, password })),
      setRole: (role: Role) => set((state: UserState) => ({ ...state, role })),
    }),
    {
      name: "user-storage", // Give a unique name for the local storage key
    }
  )
);
