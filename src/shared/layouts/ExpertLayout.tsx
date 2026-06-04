import { DashboardLayout } from './DashboardLayout';
import { Role } from '@/shared/types/enums';

export function ExpertLayout() {
  return <DashboardLayout role={Role.EXPERT} />;
}
