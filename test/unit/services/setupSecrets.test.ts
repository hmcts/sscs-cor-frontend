const { expect } = require('chai');
const { cloneDeep } = require('lodash');
const config = require('config');
const proxyquire = require('proxyquire');

const modulePath = 'app/server/services/setupSecrets';

let mockConfig: any = {};

describe(modulePath, () => {
  describe('#setup', () => {
    beforeEach(() => {
      mockConfig = cloneDeep(config);
    });

    it('should set config values when secrets path is set', () => {
      mockConfig.secrets = {
        sscs: {
          'sscs-cor-redis-connection-string': 'sessionValue',
          'sscs-cor-redis-access-key': 'redisValue',
          'sscs-cor-idam-client-secret': 'idamValue',
          'sscs-s2s-secret': 'osPlacesValue'
        }
      };

      // Update config with secret setup
      const setupSecrets = proxyquire(modulePath,
        { config: mockConfig });
      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.session.redis.url)
        .to.equal(mockConfig.secrets.sscs['sscs-cor-redis-connection-string']);
      expect(mockConfig.session.redis.secret)
        .to.equal(mockConfig.secrets.sscs['sscs-cor-redis-access-key']);
      expect(mockConfig.idam.client.secret)
        .to.equal(mockConfig.secrets.sscs['sscs-cor-idam-client-secret']);
      expect(mockConfig.s2s.secret)
        .to.equal(mockConfig.secrets.sscs['sscs-s2s-secret']);
    });

    it('should not set config values when secrets path is not set', () => {
      // Update config with secret setup
      const setupSecrets = proxyquire(modulePath,
        { config: mockConfig });
      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.session.redis.url)
        .to.equal(config.session.redis.url);
      expect(mockConfig.session.redis.secret)
        .to.equal(config.session.redis.secret);
      expect(mockConfig.idam.client.secret)
        .to.equal(config.idam.client.secret);
    });

    it('should only set one config value when single secret path is set', () => {
      mockConfig.secrets = { sscs: { 'sscs-cor-redis-connection-string': 'sessionValue' } };

      // Update config with secret setup
      const setupSecrets = proxyquire(modulePath,
        { config: mockConfig });
      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.session.redis.url)
        .to.equal(mockConfig.secrets.sscs['sscs-cor-redis-connection-string']);
      expect(mockConfig.session.redis.secret)
        .to.equal(config.session.redis.secret);
      expect(mockConfig.idam.client.secret)
        .to.equal(config.idam.client.secret);
    });

  });
});
