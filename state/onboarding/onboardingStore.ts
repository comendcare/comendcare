import { create } from 'zustand';

interface OnboardingState {
    isNewOrganization: boolean;
    toggleIsNewOrganization: () => void;
    setIsNewOrganization: (value: boolean) => void;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    isNewOrganization: true, // Default state, can be false if you want to start with joining
    toggleIsNewOrganization: () => set((state) => ({ isNewOrganization: !state.isNewOrganization })),
    setIsNewOrganization: (value) => set({ isNewOrganization: value }),
}));
