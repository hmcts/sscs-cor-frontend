import { getIndex, postIndex } from 'app/server/controllers/assign-case';
import { expect, sinon } from '../../chai-sinon';
import { StatusCodes } from 'http-status-codes';
import { CaseService } from 'app/server/services/cases';
import { TrackYourApealService } from 'app/server/services/tyaService';
import content from 'app/common/locale/content.json';

describe('controllers/assign-case.js', function () {
  let req;
  let res;

  beforeEach(function () {
    res = {
      render: sinon.spy(),
      redirect: sinon.spy(),
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

    describe('post with valid data', function () {
      beforeEach(function () {
        onlineHearing = {
          hearingId: 'hearingId',
          case_id: caseId,
        };
        appeal = {
          hearingType: 'paper',
        };

        caseService = {
          assignOnlineHearingsToCitizen: sinon.stub().resolves({
            statusCode: StatusCodes.OK,
            body: onlineHearing,
          }),
        } as any;
        trackYourAppealService = {
          getAppeal: sinon.stub().resolves({
            statusCode: StatusCodes.OK,
            appeal,
          }),
        } as any;
      });

      describe('with valid postcode', function () {
        const appealType = 'otherBenefits';
        const postcode = 'cm11 1ab';
        let ibcaReference;

        beforeEach(function () {
          req = {
            app: { locals: { ibcaEnabled: true } },
            session: { idamEmail, tya },
            body: { appealType, postcode },
          } as any;

          underTest = postIndex(caseService, trackYourAppealService);
        });

        it('assigns user to case', async function () {
          await underTest(req, res);

          expect(
            caseService.assignOnlineHearingsToCitizen
          ).to.have.been.calledOnce.calledWith(
            idamEmail,
            tya,
            postcode,
            ibcaReference,
            req
          );
        });

        it('assigns user to case with no appealType for non-ibca cases', async function () {
          req.app.locals.ibcaEnabled = false;
          req.body = { postcode };

          await underTest(req, res);

          expect(
            caseService.assignOnlineHearingsToCitizen
          ).to.have.been.calledOnce.calledWith(
            idamEmail,
            tya,
            postcode,
            ibcaReference,
            req
          );
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

      describe('with valid ibcaReference', function () {
        const appealType = 'ibca';
        let postcode;
        const ibcaReference = 'aa1bb2';

        beforeEach(function () {
          req = {
            app: { locals: { ibcaEnabled: true } },
            session: { idamEmail, tya },
            body: { appealType, ibcaReference },
          } as any;

          underTest = postIndex(caseService, trackYourAppealService);
        });

        it('assigns user to case', async function () {
          await underTest(req, res);

          expect(
            caseService.assignOnlineHearingsToCitizen
          ).to.have.been.calledOnce.calledWith(
            idamEmail,
            tya,
            postcode,
            ibcaReference,
            req
          );
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
    });

    describe('post with missing data', function () {
      beforeEach(function () {
        req = {
          app: { locals: { ibcaEnabled: true } },
          session: { idamEmail, tya },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('missing appealType', async function () {
        let appealType;
        const postcode = '';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.missing.appealType,
          code: 'missing-appealType',
        };
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });

      it('ignore missing appealType for non-ibca cases', async function () {
        req.app.locals.ibcaEnabled = false;
        const postcode = '';
        req.body = { postcode };
        const error = {
          msg: content.en.assignCase.errors.missing.postcode,
          code: 'missing-postcode',
        };
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });

      it('missing postcode', async function () {
        const appealType = 'otherBenefits';
        const postcode = '';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.missing.postcode,
          code: 'missing-postcode',
        };
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });

      it('missing ibcaReference', async function () {
        const appealType = 'ibca';
        const postcode = '';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.missing.ibcaReference,
          code: 'missing-ibcaReference',
        };
        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });
    });

    describe('post with invalid data', function () {
      beforeEach(function () {
        req = {
          app: { locals: { ibcaEnabled: true } },
          session: { idamEmail, tya },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('invalid postcode', async function () {
        const appealType = 'otherBenefits';
        const postcode = 'invalid';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.invalid.postcode,
          code: 'invalid-postcode',
        };

        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });

      it('invalid ibcaReference', async function () {
        const appealType = 'ibca';
        const ibcaReference = 'invalid';
        req.body = { appealType, ibcaReference };
        const error = {
          msg: content.en.assignCase.errors.invalid.ibcaReference,
          code: 'invalid-ibcaReference',
        };

        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });
    });

    describe('post with missing tya', function () {
      beforeEach(function () {
        req = {
          app: { locals: { ibcaEnabled: true } },
          session: { idamEmail },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('redirects to task-list', async function () {
        const appealType = 'otherBenefits';
        const postcode = 'TS1 1ST';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.missing.tya,
          code: 'tyaNotProvided',
        };

        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });
    });

    describe('no matching data', function () {
      beforeEach(function () {
        caseService = {
          assignOnlineHearingsToCitizen: sinon.stub().resolves({
            statusCode: StatusCodes.BAD_REQUEST,
            body: {},
          }),
        } as any;
        req = {
          app: { locals: { ibcaEnabled: true } },
          session: { idamEmail, tya },
        } as any;

        underTest = postIndex(caseService, trackYourAppealService);
      });

      it('no matching postcode', async function () {
        const appealType = 'otherBenefits';
        const postcode = 'TS1 1ST';
        req.body = { appealType, postcode };
        const error = {
          msg: content.en.assignCase.errors.invalid.postcode,
          code: 'no-matching-record',
        };

        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });

      it('no matching ibcaReference', async function () {
        const appealType = 'ibca';
        const ibcaReference = 'TS1ST1';
        req.body = { appealType, ibcaReference };
        const error = {
          msg: content.en.assignCase.errors.invalid.ibcaReference,
          code: 'no-matching-record',
        };

        await underTest(req, res);

        expect(res.render).to.have.been.calledOnce.calledWith(
          'assign-case/index.njk',
          { error, ...req.body }
        );
      });
    });
  });
});
