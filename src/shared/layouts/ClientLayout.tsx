import { DashboardLayout } from './DashboardLayout';
import { Role } from '@/shared/types/enums';

export function ClientLayout() {
  return <DashboardLayout role={Role.CLIENT} />;
}
