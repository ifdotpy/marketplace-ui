import { inject } from '@angular/core';
import { AnalyticsTrackerService } from 'services/analytics-tracker.service';

export function initializeMatomo(): () => void {
  const analyticsTrackerService = inject(AnalyticsTrackerService);
  analyticsTrackerService.injectScript(true).then((_) => undefined);
  return () => undefined;
}
