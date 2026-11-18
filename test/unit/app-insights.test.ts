import * as appInsights from 'applicationinsights';
import { enable, trackException } from 'app/server/app-insights';
import { expect, sinon } from 'test/chai-sinon';
import config from 'config';
import { SinonStub } from 'sinon';

const roleName: string = config.get('appInsights.roleName');

describe('app-insights.js', function () {
  describe('enable', function () {
    before(function () {
      sinon.stub(appInsights, 'start');
    });

    afterEach(function () {
      sinon.resetHistory();
    });

    after(function () {
      sinon.restore();
    });

    it('sets cloud role name', function () {
      enable();
      expect(appInsights.defaultClient.context.tags['ai.cloud.role']).to.equal(
        roleName
      );
    });

    it('should call start', function () {
      enable();
      expect(appInsights.start).to.have.been.calledOnceWith();
    });
  });

  describe('trackException', function () {
    let trackExceptionStub: SinonStub;

    before(function () {
      sinon.stub(appInsights, 'start');
      enable();
    });

    beforeEach(function () {
      trackExceptionStub = sinon.stub(
        appInsights.defaultClient,
        'trackException'
      );
    });

    afterEach(function () {
      trackExceptionStub.restore();
    });

    after(function () {
      sinon.restore();
    });

    it('passes an exception with a string message through unchanged', function () {
      const error = new Error('a message');
      trackException(error);
      expect(trackExceptionStub).to.have.been.calledOnceWith({
        exception: error,
      });
    });

    it('passes a string message to the client when the message is not a string', function () {
      const error = new Error('placeholder');
      (error as { message: unknown }).message = { code: 500, reason: 'bad' };
      expect(() => trackException(error)).to.not.throw();
      const { exception } = trackExceptionStub.firstCall.args[0];
      expect(exception.message).to.equal('{"code":500,"reason":"bad"}');
      expect(exception.stack).to.equal(error.stack);
    });

    it('passes a string name to the client when the name is not a string', function () {
      const error = new Error('a message');
      (error as { name: unknown }).name = { type: 'odd' };
      expect(() => trackException(error)).to.not.throw();
      const { exception } = trackExceptionStub.firstCall.args[0];
      expect(exception.name).to.equal('{"type":"odd"}');
      expect(exception.message).to.equal('a message');
    });

    it('falls back to Error as the name when the name is missing', function () {
      const error = new Error('a message');
      (error as { name: unknown }).name = undefined;
      trackException(error);
      const { exception } = trackExceptionStub.firstCall.args[0];
      expect(exception.name).to.equal('Error');
    });

    it('does not throw when the client throws', function () {
      trackExceptionStub.throws(
        new TypeError('_a.substring is not a function')
      );
      expect(() => trackException(new Error('a message'))).to.not.throw();
    });
  });
});
