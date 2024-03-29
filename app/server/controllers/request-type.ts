import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import * as requestType from '../services/request-type';
import { TrackYourApealService } from '../services/tyaService';
import { Dependencies } from '../routes';
import { HearingRecordings } from 'app/server/models/express-session';
import { LoggerInstance } from 'winston';

const logger: LoggerInstance = Logger.getLogger('request-type.ts');

const contentType = new Map([
  ['mp3', 'audio/mp3'],
  ['MP3', 'audio/mp3'],
  ['mp4', 'video/mp4'],
  ['MP4', 'video/mp4'],
]);

const allowedActions = ['hearingRecording', 'confirm', 'formError'];

export function getRequestType() {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string = allowedActions.includes(req.params.action)
        ? req.params.action
        : '';
      const requestOptions = req.session.requestOptions;
      const hearingRecordingsResponse = req.session.hearingRecordingsResponse;
      const pageTitleError = action === 'formError';
      const emptyHearingIdError = action === 'formError';
      const appeal = req.session.appeal;

      return res.render('request-type/index.njk', {
        action,
        requestOptions,
        hearingRecordingsResponse,
        pageTitleError,
        emptyHearingIdError,
        appeal,
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function submitHearingRecordingRequest() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session.case.case_id;
      const hearingIds = req.body.hearingId;
      const emptyHearingIdError = !hearingIds;

      if (emptyHearingIdError) {
        return res.redirect(`${Paths.requestType}/formError`);
      }

      await requestType.submitHearingRecordingRequest(caseId, hearingIds, req);
      req.session.hearingRecordingsResponse = null;
      return res.redirect(`${Paths.requestType}/confirm`);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function selectRequestType() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const option = req.body.requestOptions;
      const caseId = req.session.case.case_id;
      if (option === 'hearingRecording') {
        req.session.requestOptions = 'hearingRecording';
        const hearingRecordingsResponse: HearingRecordings =
          await requestType.getHearingRecording(caseId, req);
        if (hearingRecordingsResponse) {
          req.session.hearingRecordingsResponse = hearingRecordingsResponse;
        }
        return res.redirect(`${Paths.requestType}/hearingRecording`);
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

export function getHearingRecording(
  trackYourAppealService: TrackYourApealService
) {
  return async (req: Request, res: Response) => {
    const evidence = await trackYourAppealService.getMediaFile(
      req.query.url as string,
      req
    );
    res.header('content-type', contentType.get(req.query.type as string));
    res.send(Buffer.from(evidence, 'binary'));
  };
}

export function setupRequestTypeController(deps: Dependencies) {
  const router = Router();
  router.get(
    `${Paths.requestType}/recording`,
    deps.prereqMiddleware,
    getHearingRecording(deps.trackYourApealService)
  );
  router.get(
    `${Paths.requestType}/:action?`,
    deps.prereqMiddleware,
    getRequestType()
  );
  router.post(
    `${Paths.requestType}/select`,
    deps.prereqMiddleware,
    selectRequestType()
  );
  router.post(
    `${Paths.requestType}/hearing-recording-request`,
    deps.prereqMiddleware,
    submitHearingRecordingRequest()
  );
  return router;
}
