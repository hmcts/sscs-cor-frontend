import { expect } from 'chai';
import config from 'config';
import proxyquire from 'proxyquire';
import { cloneDeep } from 'lodash';

const modulePath = 'app/server/services/setupSecrets';

let mockConfig: any = {};

const redisSecret: string = config.get('redis.secret');
const cookieSecret: string = config.get('session.cookie.secret');
const idamSecret: string = config.get('idam.client.secret');

describe(modulePath, function () {
  describe('#setup', function () {
    beforeEach(function () {
      mockConfig = cloneDeep(config);
    });

    it('should set config values when secrets path is set', function () {
      mockConfig.secrets = {
        sscs: {
          'sscs-cor-redis-access-key': 'redisValue',
          tyacookiesecret: 'cookieSecret',
          'idam-sscs-oauth2-client-secret': 'idamValue',
          'sscs-s2s-secret': 'osPlacesValue',
        },
      };

      // Update config with secret setup
      const { setupKeyVaultSecrets } = proxyquire(modulePath, {
        config: mockConfig,
      });
      setupKeyVaultSecrets();

      expect(mockConfig.redis.secret).to.equal(
        mockConfig.secrets.sscs['sscs-cor-redis-access-key']
      );
      expect(mockConfig.session.cookie.secret).to.equal(
        mockConfig.secrets.sscs.tyacookiesecret
      );
      expect(mockConfig.idam.client.secret).to.equal(
        mockConfig.secrets.sscs['idam-sscs-oauth2-client-secret']
      );
      expect(mockConfig.s2s.secret).to.equal(
        mockConfig.secrets.sscs['sscs-s2s-secret']
      );
    });

    it('should not set config values when secrets path is not set', function () {
      // Update config with secret setup
      const { setupKeyVaultSecrets } = proxyquire(modulePath, {
        config: mockConfig,
      });
      setupKeyVaultSecrets();

      expect(mockConfig.redis.secret).to.equal(redisSecret);
      expect(mockConfig.session.cookie.secret).to.equal(cookieSecret);
      expect(mockConfig.idam.client.secret).to.equal(idamSecret);
    });

    it('should only set one config value when single secret path is set', function () {
      // Update config with secret setup
      const { setupKeyVaultSecrets } = proxyquire(modulePath, {
        config: mockConfig,
      });
      setupKeyVaultSecrets();

      expect(mockConfig.redis.secret).to.equal(redisSecret);
      expect(mockConfig.idam.client.secret).to.equal(idamSecret);
    });
  });
});
