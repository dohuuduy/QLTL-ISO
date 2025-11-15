import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  openFlyoutView: string | null; // Theo dõi menu con đang mở
  toggleSidebar: () => void;
  setMobileOpen: (isOpen: boolean) => void;
  toggleFlyoutView: (view: string) => void; // Dành cho NavItem gọi
  setOpenFlyoutView: (view: string | null) => void; // Dành cho Layout để đóng tất cả
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isCollapsed: false,
      isMobileOpen: false,
      openFlyoutView: null,
      toggleSidebar: () => set((state) => ({ 
        isCollapsed: !state.isCollapsed, 
        openFlyoutView: null // Đóng menu con khi bật/tắt sidebar
      })),
      setMobileOpen: (isOpen) => set({ isMobileOpen: isOpen }),
      toggleFlyoutView: (view) => set((state) => ({
        openFlyoutView: state.openFlyoutView === view ? null : view,
      })),
      setOpenFlyoutView: (view) => set({ openFlyoutView: view }),
    }),
    {
      name: 'sidebar-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ isCollapsed: state.isCollapsed }),
    }
  )
);
