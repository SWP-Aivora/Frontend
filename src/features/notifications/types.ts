export const NotificationType = {
  DELIVERABLE_SUBMITTED: 'DeliverableSubmitted',
  NEW_PROPOSAL_RECEIVED: 'NewProposalReceived',
  PAYMENT_RELEASED: 'PaymentReleased',
  SYSTEM: 'System',
  GENERAL: 'General',
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export const NotificationPriority = {
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

export const NotificationStatus = {
  UNREAD: 'Unread',
  READ: 'Read',
  ACTION_REQUIRED: 'ActionRequired',
  RESOLVED: 'Resolved',
} as const;

export type NotificationStatus = typeof NotificationStatus[keyof typeof NotificationStatus];

export interface Notification {
  id: string;
  type: NotificationType | string;
  title: string;
  message: string;
  projectName?: string;
  priority: NotificationPriority | string;
  status: NotificationStatus | string;
  isRead: boolean;
  createdAt: string;
  relatedEntityId?: string; // ID of the related project/proposal/milestone
}

export interface NotificationsQuery {
  PageSize?: number;
  PageIndex?: number;
  SearchTerm?: string;
  // Note: These filters might not be supported by backend yet, 
  // keeping them for future or UI-side filtering
  Type?: string;
  Status?: string;
  Priority?: string;
  DateRange?: string;
}

export interface UnreadCountResponse {
  count: number;
}

