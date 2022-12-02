import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

const logger: LoggerInstance = Logger.getLogger('hearingUtils');

const HEARING_BOOKED_EVENT_TYPES = ['HEARING_BOOKED', 'NEW_HEARING_BOOKED'];

export function shouldShowHearing(appeal): boolean {
  const hideHearing = appeal?.hideHearing !== true;
  logger.info(`Showing hearing: ${hideHearing} for case ${appeal?.case_id}`);
  return hideHearing;
}

export function isHearingBookedEvent(event): boolean {
  const type: string = event.type;
  return HEARING_BOOKED_EVENT_TYPES.includes(type);
}

export function getHearingInfo(appeal) {
  const { latestEvents = [], historicalEvents = [] } = appeal;
  return latestEvents.concat(historicalEvents).find(isHearingBookedEvent);
}
