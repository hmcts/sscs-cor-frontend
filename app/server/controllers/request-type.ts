import { Router, Request, Response, NextFunction } from 'express';
import * as Paths from '../paths';
import * as AppInsights from '../app-insights';
import { Logger } from '@hmcts/nodejs-logging';
import { HearingRecordingResponse, RequestTypeService } from '../services/request-type';
import { TrackYourApealService } from '../services/tyaService';
const i18next = require('i18next');

const logger = Logger.getLogger('request-type.ts');
const content = require('../../../locale/content');

const contentType = new Map([
  ['mp3', 'audio/mp3'],
  ['MP3', 'audio/mp3'],
  ['mp4', 'video/mp4'],
  ['MP4', 'video/mp4']
]);

function getRequestType(req: Request, res: Response) {
  return res.render('request-type/index.html', {});
}

function submitHearingRecordingRequest(requestTypeService: RequestTypeService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    try {
      const caseId = req.session['hearing'].case_id;
      const hearingIds = req.body['hearingId'];
      const emptyHearingIdError = hearingIds ? false : true;

      if (emptyHearingIdError) {
        const hearingRecordingsResponse = req.session['hearingRecordingsResponse'];
        const label = req.session['label'];
        return res.render('request-type/index.html',
          {
            action: 'hearingRecording',
            hearingRecordingsResponse: hearingRecordingsResponse,
            requestTypeLabel: label,
            pageTitleError: true,
            emptyHearingIdError: emptyHearingIdError
          }
        );
      }

      req.session['hearingRecordingsResponse'] = '';
      req.session['label'] = '';

      await requestTypeService.submitHearingRecordingRequest(caseId, hearingIds, req);
      return res.render('request-type/index.html', {
        action: 'confirm'
      });
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function selectRequestType(requestTypeService: RequestTypeService) {
  return async(req: Request, res: Response, next: NextFunction) => {
    try {
      const option = req.body['request-options'];
      const caseId = req.session['hearing'].case_id;

      if ('hearingRecording' === option) {
        const hearingRecordingsResponse: HearingRecordingResponse = await requestTypeService.getHearingRecording(caseId, req);
        let label: string;
        if (hearingRecordingsResponse) {
          label = content[i18next.language].hearingRecording.hearingRecordings;
        } else {
          label = content[i18next.language].hearingRecording.noRecordings;
        }

        req.session['hearingRecordingsResponse'] = hearingRecordingsResponse;
        req.session['label'] = label;

        return res.render('request-type/index.html', {
          action: 'hearingRecording',
          hearingRecordingsResponse: hearingRecordingsResponse,
          requestTypeLabel: label
        });
      }
    } catch (error) {
      AppInsights.trackException(error);
      return next(error);
    }
  };
}

function getHearingRecording(trackYourAppealService: TrackYourApealService) {
  return async (req: Request, res: Response) => {
    const evidence = await trackYourAppealService.getMediaFile(req.query.url as string, req);
    res.header('content-type', contentType.get(req.query.fileType as string));
    res.send(Buffer.from(evidence, 'binary'));
  };
}

function setupRequestTypeController(deps: any) {
  const router = Router();
  router.get(Paths.requestType, deps.prereqMiddleware, getRequestType);
  router.get(`${Paths.requestType}/recording`,
      deps.prereqMiddleware,
      getHearingRecording(deps.trackYourApealService));
  router.post(`${Paths.requestType}/select`,
    deps.prereqMiddleware,
    selectRequestType(deps.requestTypeService)
  );
  router.post(`${Paths.requestType}/hearing-recording-request`,
    deps.prereqMiddleware,
    submitHearingRecordingRequest(deps.requestTypeService)
  );
  return router;
}

export {
  setupRequestTypeController,
  selectRequestType,
  submitHearingRecordingRequest
};
