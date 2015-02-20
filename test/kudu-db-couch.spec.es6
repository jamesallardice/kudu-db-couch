import qouchMockFactory from '../../node_modules/qouch/test/qouch-mock';
import proxyquire from 'proxyquire';
import chai from 'chai';

import fixtures from './fixtures';

let qouchMock = qouchMockFactory(fixtures);

let mockApp = {};
let Adapter = proxyquire('../src/kudu-db-couch', {
  qouch: qouchMock
});

let expect = chai.expect;

describe('Kudu CouchDB adapter', () => {

  let adapter;

  beforeEach(() => {
    adapter = new Adapter(mockApp, {
      url: 'http://localhost:5984/database',
      views: {}
    });
  });

  it('should throw an error when not passed a database URL', () => {
    let test = () => new Adapter(mockApp);
    expect(test).to.throw(Error, /requires a database URL/);
  });

  it('should default the views config to an empty object', () => {
    let adapter = new Adapter(mockApp, {
      url: 'http://localhost:5984/database'
    });
    expect(adapter.config.views).to.be.empty();
  });

  it('should expose the Kudu app as an instance property', () => {
    expect(adapter.kudu).to.equal(mockApp);
  });
});
