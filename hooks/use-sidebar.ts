import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  setMobileOpen: (isOpen: boolean) => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setMobileOpen: (isOpen) => set({ isMobileOpen: isOpen }),
    }),
    {
      name: 'sidebar-storage', // Tên key trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isCollapsed: state.isCollapsed }), // Chỉ lưu trạng thái isCollapsed
    }
  )
);
