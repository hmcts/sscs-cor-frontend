import { getIndex, postIndex } from 'app/server/controllers/assign-case';
import { expect, sinon } from '../../chai-sinon';
import { OK } from 'http-status-codes';
import { CaseService } from '../../../app/server/services/cases';
import { TrackYourApealService } from '../../../app/server/services/tyaService';
const content = require('locale/content');

describe('controllers/assign-case.js', function () {
  let sandbox: sinon.SinonSandbox;
  let req;
  let res;

  beforeEach(function () {
    sandbox = sinon.createSandbox();
    res = {
      render: sandbox.spy(),
      redirect: sandbox.spy(),
    } as any;
  });

  describe('getIndex', function () {
    it('should render assign-case page', function () {
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

  describe('postIndex', function () {
    const idamEmail = 'someEmail@example.com';
    const tya = 'some-tya-number';
    const caseId = 'caseId';
    let onlineHearing;
    let appeal;
    let caseService: CaseService = null;
    let trackYourAppealService: TrackYourApealService;
    let underTest;

    beforeEach(function () {
      onlineHearing = {
        hearingId: 'hearingId',
        case_id: caseId,
      };
      appeal = {
        hearingType: 'paper',
      };

      caseService = {
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

    describe('for valid postcode', function () {
      const postcode = 'cm11 1ab';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('assigns user to case', async function () {
        await underTest(req, res);

        expect(
          caseService.assignOnlineHearingsToCitizen
        ).to.have.been.calledOnce.calledWith(idamEmail, tya, postcode, req);
      });

      it('gets appeal', async function () {
        await underTest(req, res);

        expect(
          trackYourAppealService.getAppeal
        ).to.have.been.calledOnce.calledWith(caseId, req);
      });

      it('redirects to task-list', async function () {
        await underTest(req, res);

        expect(res.redirect).to.have.been.calledOnce.calledWith('/status');
      });

      it('sets hearing in session', async function () {
        await underTest(req, res);

        expect(req.session.case).to.be.eql(onlineHearing);
      });

      it('sets appeal in session', async function () {
        await underTest(req, res);

        expect(req.session.appeal).to.be.eql(appeal);
      });
    });

    describe('for missing postcode and hideHearing true', function () {
      const postcode = 'cm11 1ab';

      beforeEach(function () {
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

        underTest = postIndex(caseService, trackYourAppealService);
      });
    });

    describe('for missing postcode', function () {
      const postcode = '';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.noPostcode }
        );
      });
    });

    describe('for invalid postcode', function () {
      const postcode = 'invalid';

      beforeEach(function () {
        req = {
          session: { idamEmail, tya },
          body: { postcode },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.invalidPostcode }
        );
      });
    });

    describe('for missing tya', function () {
      const postcode = 'TS1 1ST';

      beforeEach(function () {
        req = {
          session: { idamEmail },
          body: { postcode },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error: content.en.assignCase.errors.tyaNotProvided }
        );
      });
    });
  });
});
