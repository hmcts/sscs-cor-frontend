import { getIndex, postIndex } from 'app/server/controllers/assign-case';
import { expect, sinon } from '../../chai-sinon';
import { OK } from 'http-status-codes';
import { HearingService } from '../../../app/server/services/hearing';
import { TrackYourApealService } from '../../../app/server/services/tyaService';
const content = require('locale/content');

describe('controllers/assign-case.js', () => {
  let sandbox: sinon.SinonSandbox;
  let req;
  let res;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    res = {
      render: sandbox.spy(),
      redirect: sandbox.spy(),
    } as any;
  });

  describe('getIndex', () => {
    it('should render assign-case page', () => {
      req = {
        query: {},
      } as any;

      getIndex(req, res);
      expect(res.render).to.have.been.calledOnce.calledWith(
        'assign-case/index.njk',
        {}
      );
    });
  });

  describe('postIndex', () => {
    const idamEmail = 'someEmail@example.com';
    const tya = 'some-tya-number';
    const caseId = 'caseId';
    let onlineHearing;
    let appeal;
    let hearingService: HearingService;
    let trackYourAppealService: TrackYourApealService;
    let underTest;

    beforeEach(() => {
      onlineHearing = {
        hearingId: 'hearingId',
        case_id: caseId,
      };
      appeal = {
        hearingType: 'paper',
      };

      hearingService = {
        assignOnlineHearingsToCitizen: sandbox.stub().resolves({
          statusCode: OK,
          body: onlineHearing,
        }),
      } as any;
      trackYourAppealService = {
        getAppeal: sandbox.stub().resolves({
          statusCode: OK,
          appeal,
        }),
      } as any;
    });

    describe('for valid postcode', () => {
      const postcode = 'cm11 1ab';

      beforeEach(() => {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(hearingService, trackYourAppealService);
      });

      it('assigns user to case', async () => {
        await underTest(req, res);

        expect(
          hearingService.assignOnlineHearingsToCitizen
        ).to.have.been.calledOnce.calledWith(idamEmail, tya, postcode, req);
      });

      it('gets appeal', async () => {
        await underTest(req, res);

        expect(
          trackYourAppealService.getAppeal
        ).to.have.been.calledOnce.calledWith(caseId, req);
      });

      it('redirects to task-list', async () => {
        await underTest(req, res);

        expect(res.redirect).to.have.been.calledOnce.calledWith('/status');
      });

      it('sets hearing in session', async () => {
        await underTest(req, res);

        expect(req.session.hearing).to.be.eql(onlineHearing);
      });

      it('sets appeal in session', async () => {
        await underTest(req, res);

        expect(req.session.appeal).to.be.eql(appeal);
      });

      it('sets hideHearing false in session', async () => {
        await underTest(req, res);

        expect(req.session.hideHearing).to.be.eql(false);
      });
    });

    describe('for missing postcode and hideHearing true', () => {
      const postcode = 'cm11 1ab';

      beforeEach(() => {
        trackYourAppealService = {
          getAppeal: sandbox.stub().resolves({
            statusCode: OK,
            appeal: {
              hearingType: 'paper',
              hideHearing: true,
            },
          }),
        } as any;

        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(hearingService, trackYourAppealService);
      });

      it('sets hideHearing true in session', async () => {
        await underTest(req, res);

        expect(req.session.hideHearing).to.be.eql(true);
      });
    });

    describe('for missing postcode', () => {
      const postcode = '';

      beforeEach(() => {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(hearingService, trackYourAppealService);
      });

      it('redirects to task-list', async () => {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.noPostcode }
        );
      });
    });

    describe('for invalid postcode', () => {
      const postcode = 'invalid';

      beforeEach(() => {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(hearingService, trackYourAppealService);
      });

      it('redirects to task-list', async () => {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.invalidPostcode }
        );
      });
    });

    describe('for missing tya', () => {
      const postcode = 'TS1 1ST';

      beforeEach(() => {
        req = {
          session: { idamEmail },
          body: { postcode },
        } as any;

        underTest = postIndex(hearingService, trackYourAppealService);
      });

      it('redirects to task-list', async () => {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.tyaNotProvided }
        );
      });
    });
  });
});
