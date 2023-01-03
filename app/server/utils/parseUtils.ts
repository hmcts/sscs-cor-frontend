import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import { ParsedQs } from 'qs';

const logger: LoggerInstance = Logger.getLogger('parseUtils');

export function resolveQuery(
  query: string | string[] | ParsedQs | ParsedQs[]
): string {
  if (typeof query === 'string') {
    return query;
  }
  if (query instanceof Array && typeof query[0] === 'string') {
    return query[0];
  }
  return null;
}
