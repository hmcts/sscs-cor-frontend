import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { Appeal, CaseEvent } from '../models/express-session';

const logger: LoggerInstance = Logger.getLogger('hearingUtils');

const HEARING_BOOKED_EVENT_TYPES = ['HEARING_BOOKED', 'NEW_HEARING_BOOKED'];

export function shouldShowHearing(appeal: Appeal): boolean {
  const hideHearing = appeal?.hideHearing !== true;
  logger.info(`Showing hearing: ${hideHearing} for case ${appeal?.caseId}`);
  return hideHearing;
}

export function isHearingBookedEvent(event: CaseEvent): boolean {
  const type: string = event.type;
  return HEARING_BOOKED_EVENT_TYPES.includes(type);
}

export function getHearingInfo(appeal: Appeal): CaseEvent {
  const { latestEvents = [], historicalEvents = [] } = appeal;
  return latestEvents.concat(historicalEvents).find(isHearingBookedEvent);
}
