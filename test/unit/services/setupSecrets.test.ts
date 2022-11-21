import { expect } from 'chai';
const { cloneDeep } = require('lodash');
const config = require('config');
const proxyquire = require('proxyquire');

const modulePath = 'app/server/services/setupSecrets';

let mockConfig: any = {};

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

      expect(mockConfig.redis.secret).to.equal(config.redis.secret);
      expect(mockConfig.session.cookie.secret).to.equal(
        config.session.cookie.secret
      );
      expect(mockConfig.idam.client.secret).to.equal(config.idam.client.secret);
    });

    it('should only set one config value when single secret path is set', function () {
      // Update config with secret setup
      const { setupKeyVaultSecrets } = proxyquire(modulePath, {
        config: mockConfig,
      });
      setupKeyVaultSecrets();

      expect(mockConfig.redis.secret).to.equal(config.redis.secret);
      expect(mockConfig.idam.client.secret).to.equal(config.idam.client.secret);
    });
  });
});
