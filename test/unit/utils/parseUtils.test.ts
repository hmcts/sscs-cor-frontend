import { expect } from 'test/chai-sinon';
import { resolveQuery } from 'app/server/utils/parseUtils';
import { ParsedQs } from 'qs';

describe('dateUtil class', function () {
  const query = 'test';

  it('should return query when the input is a string', function () {
    expect(resolveQuery(query)).to.equal(query);
  });

  it('should return query when the input is a string array', function () {
    const input: string[] = [query];
    expect(resolveQuery(input)).to.equal(query);
  });

  it('should return null when the input is a string but undefined', function () {
    // eslint-disable-next-line no-undefined
    const input: string = undefined;
    expect(resolveQuery(input)).to.equal(null);
  });

  it('should return null when the input is a ParsedQs', function () {
    const input: ParsedQs = { test: 'test' };
    expect(resolveQuery(input)).to.equal(null);
  });

  it('should return null when the input is a ParsedQs array', function () {
    const input: ParsedQs[] = [{ test: 'test' }];
    expect(resolveQuery(input)).to.equal(null);
  });
});
