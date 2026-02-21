import { create } from 'zustand';

interface UserSession {
    name: string;
    email: string;
    avatarUrl?: string;
}

interface AppState {
    user: UserSession | null;
    balance: number;
    login: (user: UserSession) => void;
    logout: () => void;
    updateBalance: (amount: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    user: {
        name: "Guest User",
        email: "guest@badtrade.com",
        avatarUrl: "https://github.com/shadcn.png"
    },
    balance: 1000000, // Initial dummy balance
    login: (user) => set({ user }),
    logout: () => set({ user: null }),
    updateBalance: (amount) => set((state) => ({ balance: state.balance + amount })),
}));
