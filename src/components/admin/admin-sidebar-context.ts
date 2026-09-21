import { createContext, useContext } from "react";

export type AdminSidebarContextValue = {
  compact: boolean;
};

export const AdminSidebarContext = createContext<AdminSidebarContextValue>({
  compact: false,
});

export function useAdminSidebarCompact(): boolean {
  return useContext(AdminSidebarContext).compact;
}

export const ADMIN_SIDEBAR_COMPACT_STORAGE_KEY =
  "aditsystem-admin-sidebar-compact";
