import { createContext, useContext } from "react";

import type { PersonasStructureView } from "@/components/admin/organization-structure-views";

export type AdminOrganizationNavValue = {
  value: PersonasStructureView;
  onChange: (view: PersonasStructureView) => void;
};

export const AdminOrganizationNavContext =
  createContext<AdminOrganizationNavValue | null>(null);

export function useAdminOrganizationNav(): AdminOrganizationNavValue | null {
  return useContext(AdminOrganizationNavContext);
}
