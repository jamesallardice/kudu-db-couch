import chai from 'chai';

import Adapter from '../src/kudu-db-couch';

let expect = chai.expect;

const DB_PATH = '/database';
const DB_PORT = 5984;
const DB_HOST = 'localhost';

describe('Kudu CouchDB adapter', () => {

  let adapter;

  beforeEach(() => {
    adapter = new Adapter({
      host: DB_HOST,
      port: DB_PORT,
      path: DB_PATH,
      views: {},
    });
  });

  it('should throw an error when not passed a database path', () => {
    let test = () => new Adapter();
    expect(test).to.throw(Error, /path/);
  });

  it('should default the views config to an empty object', () => {
    let adapter = new Adapter({
      path: DB_PATH,
    });
    expect(adapter.config.views).to.be.empty;
  });
});
