const { expect, sinon } = require('test/chai-sinon');
const { checkAccessToken, setLocals, ensureAuthenticated } = require('app/server/middleware/ensure-authenticated.ts');
import * as Paths from 'app/server/paths';

describe('middleware/ensure-authenticated', () => {
  let req;
  let res;
  let next;
  const hearingDetails = {
    online_hearing_id: '1',
    case_reference: '12345',
    appellant_name: 'John Smith'
  };

  beforeEach(() => {
    req = {
      session: {
        accessToken: 'xxxxxxxxxxxxx',
        id: '123',
        hearing: hearingDetails,
        appeal: {
          hearingType: 'oral'
        },
        destroy: sinon.stub().yields()
      },
      cookie: {}
    };
    res = {
      redirect: sinon.spy(),
      locals: {}
    };
    next = sinon.spy();
  });

  describe('#checkAccessToken', () => {
    it('calls next when accessToken exists in the session', () => {
      checkAccessToken(req, res, next);
      expect(next).to.have.been.calledOnce.calledWith();
    });

    describe('when noaccessToken exists', () => {
      beforeEach(() => {
        delete req.session.accessToken;
        checkAccessToken(req, res, next);
      });

      it('destroys the session and redirects to login', () => {
        expect(req.session.destroy).to.have.been.calledOnce.calledWith();
        expect(res.redirect).to.have.been.calledOnce.calledWith(Paths.login);
      });

      it('does not call next', () => (
        expect(next).to.not.have.been.called
      ));
    });
  });

  describe('#setLocals', () => {
    it('sets hearing data on the locals', () => {
      req.session.appeal = undefined;
      setLocals(req, res, next);
      expect(res.locals).to.have.property('hearing');
      expect(res.locals).to.not.have.property('tabs');
      expect(res.locals.hearing).to.deep.equal(hearingDetails);
    });
    it('also sets tabs data on the locals', () => {
      req.cookies = {
        manageYourAppeal: 'true',
        hearingOutcomeTab: 'true'
      };
      req.session['appeal'] = {
        hearingType: 'oral',
        hearingOutcome: []
      };

      setLocals(req, res, next);
      expect(res.locals).to.have.property('tabs');
      const members = [];
      res.locals.tabs.forEach((t) => {
        members.push(t.id);
      });
      expect(members).to.have.members(['status','hearing', 'outcome']);
    });
    it('also remove outcome tab if hearingOutcome not present', () => {
      req.cookies = {
        manageYourAppeal: 'true',
        hearingOutcomeTab: 'true'
      };
      req.session['appeal'] = {
        hearingType: 'oral'
      };

      setLocals(req, res, next);
      expect(res.locals).to.have.property('tabs');
      const members = [];
      res.locals.tabs.forEach((t) => {
        members.push(t.id);
      });
      expect(members).to.have.members(['status','hearing']);
    });
    it('also remove outcome tab if hearingOutcomeTab flag is false', () => {
      req.cookies = {
        manageYourAppeal: 'true',
        hearingOutcomeTab: 'false'
      };
      req.session['appeal'] = {
        hearingType: 'oral',
        hearingOutcome: []
      };

      setLocals(req, res, next);
      expect(res.locals).to.have.property('tabs');
      const members = [];
      res.locals.tabs.forEach((t) => {
        members.push(t.id);
      });
      expect(members).to.have.members(['status','hearing']);
    });
    it('does not set tabs on the locals if cor appeal', () => {
      req.cookies = {
        manageYourAppeal: 'true'
      };
      req.session['appeal'] = {
        hearingType: 'cor'
      };

      setLocals(req, res, next);
      expect(res.locals).to.not.have.property('tabs');
    });
    it('sets showSignOut on the locals', () => {
      setLocals(req, res, next);
      expect(res.locals).to.have.property('showSignOut', true);
    });
  });

  describe('#ensureAuthenicated', () => {
    it('is an array of middleware functions', () => {
      expect(ensureAuthenticated).to.be.an('array');
      /* eslint-disable-next-line no-magic-numbers */
      expect(ensureAuthenticated).to.have.lengthOf(2);
    });
  });
});

export {};
