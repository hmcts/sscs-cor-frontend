import HttpException, {
  toErrorMessage,
} from 'app/server/exceptions/HttpException';
import { expect } from 'test/chai-sinon';

describe('exceptions/HttpException', function () {
  describe('toErrorMessage', function () {
    it('returns a string unchanged', function () {
      expect(toErrorMessage('a message')).to.equal('a message');
    });

    it('returns the message of an Error', function () {
      expect(toErrorMessage(new Error('x'))).to.equal('x');
    });

    it('serialises an object', function () {
      expect(toErrorMessage({ code: 500 })).to.equal('{"code":500}');
    });

    it('falls back to String for values that cannot be serialised', function () {
      const circular: { self?: unknown } = {};
      circular.self = circular;
      expect(toErrorMessage(circular)).to.equal('[object Object]');
      expect(toErrorMessage(undefined)).to.equal('undefined');
    });
  });

  it('uses the message of an Error passed as the message', function () {
    const exception = new HttpException(500, new Error('upstream failed'));
    expect(exception.message).to.equal('upstream failed');
    expect(exception.status).to.equal(500);
  });
});
