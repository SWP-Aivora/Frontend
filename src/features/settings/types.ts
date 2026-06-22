export type NotificationPreferences = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  projectUpdates: boolean;
};

export type PrivacySettings = {
  profileVisibility: 'public' | 'private' | 'contacts';
  showEmail: boolean;
  showPhone: boolean;
};

export type UserSettings = {
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  language: string;
  theme: 'light' | 'dark';
};
