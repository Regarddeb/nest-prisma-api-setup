import { SetMetadata } from '@nestjs/common';

export const ACTIVITY_LOG_ACTION_KEY = 'activityLogAction';
export const SKIP_ACTIVITY_LOG_KEY = 'skipActivityLog';

/** Human-readable action name recorded in the ActivityLog (defaults to "METHOD /path"). */
export const LogActivity = (action: string) =>
  SetMetadata(ACTIVITY_LOG_ACTION_KEY, action);

/** Opts a mutating route out of activity logging (e.g. noisy/internal endpoints). */
export const SkipActivityLog = () => SetMetadata(SKIP_ACTIVITY_LOG_KEY, true);
