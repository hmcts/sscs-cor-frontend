import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import {
  HearingRecordingResponse,
  RequestTypeService,
} from '../services/request-type';
import { TrackYourApealService } from '../services/tyaService';
const logger = Logger.getLogger('request-type.ts');

const contentType = new Map([
  ['mp3', 'audio/mp3'],
  ['MP3', 'audio/mp3'],
  ['mp4', 'video/mp4'],
  ['MP4', 'video/mp4'],
]);

const allowedActions = ['hearingRecording', 'confirm', 'formError'];

function getRequestType() {
  // eslint-disable-next-line @typescript-eslint/require-await
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const action: string = allowedActions.includes(req.params.action)
        ? req.params.action
        : '';
      const requestOptions = req.session['requestOptions'];
      const hearingRecordingsResponse =
        req.session['hearingRecordingsResponse'];
      const pageTitleError = action === 'formError';
      const emptyHearingIdError = action === 'formError';
      const appeal = req.session['appeal']!;

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

function submitHearingRecordingRequest(requestTypeService: RequestTypeService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session['hearing'].case_id;
      const hearingIds = req.body['hearingId'];
      const emptyHearingIdError = !hearingIds;

      if (emptyHearingIdError) {
        return res.redirect(`${Paths.requestType}/formError`);
      }

      await requestTypeService.submitHearingRecordingRequest(
        caseId,
        hearingIds,
        req
      );
      req.session['hearingRecordingsResponse'] = '';
      return res.redirect(`${Paths.requestType}/confirm`);
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function selectRequestType(requestTypeService: RequestTypeService) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const option = req.body['requestOptions'];
      const caseId = req.session['hearing'].case_id;
      if (option === 'hearingRecording') {
        req.session['requestOptions'] = 'hearingRecording';
        const hearingRecordingsResponse: HearingRecordingResponse =
          await requestTypeService.getHearingRecording(caseId, req);
        if (hearingRecordingsResponse) {
          req.session['hearingRecordingsResponse'] = hearingRecordingsResponse;
        }
        return res.redirect(`${Paths.requestType}/hearingRecording`);
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function getHearingRecording(trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    const evidence = await trackYourAppealService.getMediaFile(
      req.query.url as string,
      req
    );
    res.header('content-type', contentType.get(req.query.type as string));
    res.send(Buffer.from(evidence, 'binary'));
  };
}

function setupRequestTypeController(deps: any) {
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
    selectRequestType(deps.requestTypeService)
  );
  router.post(
    `${Paths.requestType}/hearing-recording-request`,
    deps.prereqMiddleware,
    submitHearingRecordingRequest(deps.requestTypeService)
  );
  return router;
}

export {
  getRequestType,
  setupRequestTypeController,
  selectRequestType,
  submitHearingRecordingRequest,
  getHearingRecording,
};
