import Qouch from 'qouch';

export default class CouchAdapter {

  constructor( kudu, config = {} ) {
    this.kudu = kudu;
    this.qouch = new Qouch(config.url);
  }

  create( model ) {

  }

  get( type, id ) {

  }

  getAll( type ) {

  }

  getDescendants( ancestorType, ancestorId, descendantType ) {

  }

  update( model ) {

  }

  delete( model ) {

  }
}
