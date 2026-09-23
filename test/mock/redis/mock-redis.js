const mockRequire = require('mock-require');
const { EventEmitter } = require('events');

class FakeRedis extends EventEmitter {
    constructor(...args) {
        super();
        console.log('[mock-redis] Using MOCKED ioredis client — no real Redis connection will be made');
    }
    ping() { return Promise.resolve('PONG'); }
    get() { return Promise.resolve(null); }
    set() { return Promise.resolve('OK'); }
    del() { return Promise.resolve(1); }
    destroy() { return Promise.resolve(1); }
    expire() { return Promise.resolve(1); }
    touch() { return Promise.resolve(1); }
    quit() { return Promise.resolve('OK'); }
    disconnect() {}
}

// Real ioredis exposes both `module.exports = Redis` and `Redis.default = Redis`
// so default imports work with or without esModuleInterop. Replicate that here.
FakeRedis.default = FakeRedis;

console.log('[mock-redis] Intercepting require("ioredis") for this test run');
mockRequire('ioredis', FakeRedis);