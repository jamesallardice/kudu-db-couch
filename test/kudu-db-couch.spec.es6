import chai from 'chai';

import Adapter from '../src/kudu-db-couch';

let mockApp = {};
let expect = chai.expect;

const DB_PATH = '/database';

describe('Kudu CouchDB adapter', () => {

  let adapter;

  beforeEach(() => {
    adapter = new Adapter(mockApp, {
      path: DB_PATH,
      views: {},
    });
  });

  it('should throw an error when not passed a database path', () => {
    let test = () => new Adapter(mockApp);
    expect(test).to.throw(Error, /path/);
  });

  it('should default the views config to an empty object', () => {
    let adapter = new Adapter(mockApp, {
      path: DB_PATH,
    });
    expect(adapter.config.views).to.be.empty;
  });

  it('should expose the Kudu app as an instance property', () => {
    expect(adapter.kudu).to.equal(mockApp);
  });
});
