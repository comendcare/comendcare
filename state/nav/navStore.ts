// /src/state/auth/authStore.ts
import create from 'zustand';

type NavState = {
    isCollapsed: boolean;
    navCollapsedSize: number;
    setIsCollapsed: (isCollapsed: boolean) => void;
    defaultLayout: number[],
    setNavState: (layout: any, collapsed: boolean) => void;
};

export const useNavStore = create<NavState>((set) => ({
    isCollapsed: false,
    navCollapsedSize: 4,
    defaultLayout: [20, 32, 48],
    setIsCollapsed: (isCollapsed) => set(() => ({ isCollapsed: isCollapsed })),
    setNavState: (layout, collapsed) => set(() => ({
        defaultLayout: layout,
        defaultCollapsed: collapsed,
    }))
}));
