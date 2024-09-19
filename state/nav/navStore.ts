import { create } from 'zustand';

type NavState = {
    isCollapsed: boolean;
    navCollapsedSize: number;
    defaultLayout: number[];
    setIsCollapsed: (isCollapsed: boolean) => void;
    setLayout: (layout: number[]) => void;
    setNavState: (layout: number[], isCollapsed: boolean) => void;
};

export const useNavStore = create<NavState>((set) => ({
    isCollapsed: false, // Collapsed by default
    navCollapsedSize: 4, // Set the size when nav is collapsed
    defaultLayout: [20, 32, 48], // Default layout sizes
    setIsCollapsed: (isCollapsed) => set(() => ({ isCollapsed })),
    setLayout: (layout) => set(() => ({ defaultLayout: layout })),
    setNavState: (layout, isCollapsed) =>
        set(() => ({ defaultLayout: layout, isCollapsed })),
}));