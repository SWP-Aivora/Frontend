import { DashboardLayout } from './DashboardLayout';
import { Role } from '@/shared/types/enums';

export function AdminLayout() {
  return <DashboardLayout role={Role.ADMIN} />;
}
