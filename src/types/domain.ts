import type { Application, Event, ResumeVersion } from './database'

export interface EventWithApplication extends Event {
  application: Pick<Application, 'id' | 'company_name' | 'platform' | 'status'>
}

export interface ApplicationDetail extends Application {
  events: Event[]
  resumeVersions: ResumeVersion[]
}
