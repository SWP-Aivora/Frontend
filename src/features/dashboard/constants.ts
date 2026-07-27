import { ServiceRequestStatus } from '@/features/services/types';

export const CLIENT_POST_JOB_PATH = '/client/post-job';
export const CLIENT_EXPERTS_PATH = '/client/experts';
export const CLIENT_SERVICES_PATH = '/client/services';
export const EXPERT_FIND_WORK_PATH = '/expert/jobs';
export const EXPERT_CREATE_SERVICE_PATH = '/expert/services/new';
export const EXPERT_PROFILE_PATH = '/expert/profile';

export const DASHBOARD_ACTIVITY_COUNT_PARAMS = { PageIndex: 1, PageSize: 1 };
export const CLIENT_OPEN_JOB_POST_COUNT_PARAMS = { ...DASHBOARD_ACTIVITY_COUNT_PARAMS, status: 1 };
export const CLIENT_PENDING_SERVICE_REQUEST_COUNT_PARAMS = {
  ...DASHBOARD_ACTIVITY_COUNT_PARAMS,
  status: ServiceRequestStatus.PENDING,
};
export const DASHBOARD_RECENT_PROJECTS_PAGE_SIZE = 4;
