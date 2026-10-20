import config from 'config';
import { cloneDeep } from 'lodash';
import proxyquire from 'proxyquire';
import { expect } from 'test/chai-sinon';

describe('services/setupSecrets', function () {
  let mockConfig: any;

  beforeEach(function () {
    mockConfig = cloneDeep(config);
  });

  describe('setupKeyVaultSecrets', function () {
    it('should set the redis connection string from the managed redis secret', function () {
      mockConfig.secrets = {
        sscs: {
          'sscs-cor-managed-redis-connection-string':
            'rediss://:redisPassword@redis.example.com:6380',
        },
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.redis.url).to.equal(
        'rediss://:redisPassword@redis.example.com:6380'
      );
    });

    it('should set the session cookie secret', function () {
      mockConfig.secrets = {
        sscs: {
          tyacookiesecret: 'cookieSecret',
        },
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.session.cookie.secret).to.equal('cookieSecret');
    });

    it('should set the IDAM client secret', function () {
      mockConfig.secrets = {
        sscs: {
          'idam-sscs-oauth2-client-secret': 'idamSecret',
        },
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.idam.client.secret).to.equal('idamSecret');
    });

    it('should set the S2S secret', function () {
      mockConfig.secrets = {
        sscs: {
          'sscs-s2s-secret': 's2sSecret',
        },
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.s2s.secret).to.equal('s2sSecret');
    });

    it('should set the App Insights connection string', function () {
      mockConfig.secrets = {
        sscs: {
          'app-insights-connection-string': 'InstrumentationKey=test',
        },
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.appInsights.connectionString).to.equal(
        'InstrumentationKey=test'
      );
    });

    it('should not set secrets when the sscs secrets configuration is missing', function () {
      mockConfig.secrets = {};

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      expect(() => setupSecrets.setupKeyVaultSecrets()).to.not.throw();
    });

    it('should not overwrite config when an individual secret is missing', function () {
      mockConfig.redis.url = 'redis://127.0.0.1:6379';
      mockConfig.secrets = {
        sscs: {},
      };

      const setupSecrets = proxyquire('app/server/services/setupSecrets', {
        config: mockConfig,
      });

      setupSecrets.setupKeyVaultSecrets();

      expect(mockConfig.redis.url).to.equal('redis://127.0.0.1:6379');
    });
  });
});
