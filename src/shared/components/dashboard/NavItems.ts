import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Wallet, 
  ShieldAlert, 
  Settings, 
  UserCircle,
  Search,
  PlusCircle,
  FileText,
  type LucideIcon
} from 'lucide-react';
import { Role } from '@/shared/types/enums';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: Record<string, NavItem[]> = {
  [Role.CLIENT]: [
    { label: 'Dashboard', href: '/client', icon: LayoutDashboard },
    { label: 'My Projects', href: '/client/projects', icon: FileText },
    { label: 'Find Experts', href: '/client/experts', icon: Search },
    { label: 'Post a Job', href: '/client/post-job', icon: PlusCircle },
    { label: 'Messages', href: '/client/messages', icon: MessageSquare },
    { label: 'Wallet', href: '/client/wallet', icon: Wallet },
    { label: 'Profile', href: '/client/profile', icon: UserCircle },
  ],
  [Role.EXPERT]: [
    { label: 'Dashboard', href: '/expert', icon: LayoutDashboard },
    { label: 'Find Work', href: '/expert/jobs', icon: Search },
    { label: 'My Proposals', href: '/expert/proposals', icon: FileText },
    { label: 'My Jobs', href: '/expert/my-jobs', icon: Briefcase },
    { label: 'Messages', href: '/expert/messages', icon: MessageSquare },
    { label: 'Wallet', href: '/expert/wallet', icon: Wallet },
    { label: 'Profile', href: '/expert/profile', icon: UserCircle },
  ],
  [Role.ADMIN]: [
    { label: 'Admin Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'User Management', href: '/admin/users', icon: Users },
    { label: 'Expert Verification', href: '/admin/verification', icon: Briefcase },
    { label: 'Disputes', href: '/admin/disputes', icon: ShieldAlert },
    { label: 'System Settings', href: '/admin/settings', icon: Settings },
  ],
};
