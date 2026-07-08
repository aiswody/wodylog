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
