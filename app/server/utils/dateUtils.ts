import { Moment, utc } from 'moment/moment';
import * as CONST from '../../constants';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';

const logger: LoggerInstance = Logger.getLogger('dateUtils');

export function dateFormat(
  date: string | Moment,
  format: string = CONST.DATE_FORMAT,
  locale = 'en'
): string {
  try {
    const momentDate: Moment = typeof date === 'string' ? utc(date) : date;
    if (momentDate) {
      return momentDate.locale(locale).format(format);
    }
  } catch (error) {
    logger.error(
      `Error formatting date '${date}' with format '${format}', error:`,
      error
    );
  }
  return typeof date === 'string' ? date : date?.format();
}
