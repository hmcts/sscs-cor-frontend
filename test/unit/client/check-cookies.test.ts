import { expect, sinon } from 'test/chai-sinon';
import {
  init,
  cookieManagerConfig,
} from 'app/client/javascript/cookie-manager';
import { SinonSpy } from 'sinon';
import { LoggerInstance } from 'winston';
import { Logger } from '@hmcts/nodejs-logging';
import cookieManager from '@hmcts/cookie-manager';

const logger: LoggerInstance = Logger.getLogger('check-cookies test');

describe('Client/check-cookies', function () {
  describe('#init', function () {
    let initSpy: SinonSpy = null;
    let onSpy: SinonSpy = null;

    before(function () {
      initSpy = sinon.spy(cookieManager, 'init');
      onSpy = sinon.spy(cookieManager, 'on');
    });

    beforeEach(function () {
      initSpy.resetHistory();
      onSpy.resetHistory();
    });

    after(function () {
      initSpy.restore();
      onSpy.restore();
    });

    it('should call cookie manager method init with config', function () {
      init();
      expect(initSpy).to.have.been.calledOnceWith(cookieManagerConfig);
    });

    it('should call cookie manager method on with UserPreferencesLoaded', function () {
      init();
      expect(onSpy).to.have.been.calledOnceWith('UserPreferencesLoaded');
    });

    it('should call cookie manager method on with UserPreferencesSaved', function () {
      init();
      expect(onSpy).to.have.been.calledOnceWith('UserPreferencesSaved');
    });
  });
});
