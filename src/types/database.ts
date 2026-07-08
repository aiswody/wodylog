export interface Application {
  id: string
  user_id: string
  company_name: string
  position: string | null
  platform: string | null
  status: string
  applied_date: string | null
  memo: string | null
  created_at: string
}

export interface Event {
  id: string
  application_id: string
  event_type: string
  event_date: string
  location: string | null
  is_completed: boolean
  memo: string | null
  google_event_id: string | null
  reminder_sent_at: string | null
  created_at: string
}

export interface ResumeVersion {
  id: string
  user_id: string
  version_name: string
  content: string | null
  file_path: string | null
  file_name: string | null
  created_at: string
}

export interface ApplicationResume {
  application_id: string
  resume_version_id: string
}

export interface GoogleCalendarConnection {
  user_id: string
  calendar_id: string
  active: boolean
  connected_at: string
  disconnected_at: string | null
}

export interface PushSubscriptionRow {
  id: string
  user_id: string
  endpoint: string
  p256dh: string
  auth: string
  created_at: string
}

export interface EventTemplateItem {
  id: string
  template_id: string
  event_type: string
  day_offset: number
  sort_order: number
}

export interface EventTemplate {
  id: string
  user_id: string
  name: string
  created_at: string
  items: EventTemplateItem[]
}
