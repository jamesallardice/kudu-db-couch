import 'core-js/shim';
import Qouch from 'qouch';

let defaults = Symbol();

export default class CouchAdapter {

  get [ defaults ]() {
    return {
      views: {},
      documentToModel: ( doc ) => doc
    }
  }

  constructor( kudu, config = {} ) {

    this.config = Object.assign({}, this[ defaults ], config);

    if ( !this.config.hasOwnProperty('url') ) {
      throw new Error('CouchDB adapter requires a database URL.');
    }

    this.qouch = new Qouch(config.url);
    this.kudu = kudu;
  }

  create( model ) {
    return this.qouch.insert(model.toJSON(true));
  }

  get( type, id ) {
    return this.qouch.get(id);
  }

  getAll( type ) {

    let doc = this.config.views.types;

    if ( !doc ) {
      throw new Error('No CouchDB view configured for types.');
    }

    if ( typeof doc.design !== 'string' || typeof doc.view !== 'string') {
      throw new Error('Invalid CouchDB descendant types view.');
    }

    return this.qouch.viewDocs(doc.design, doc.view, {
      rootKey: [ type ]
    });
  }

  getDescendants( ancestorType, ancestorId, descendantType ) {

    let doc = this.config.views.descendants;

    if ( !doc ) {
      throw new Error('No CouchDB view configured for descendant types.');
    }

    if ( typeof doc.design !== 'string' || typeof doc.view !== 'string') {
      throw new Error('Invalid CouchDB descendant types view.');
    }

    return this.qouch.viewDocs(doc.design, doc.view, {
      key: [ descendantType, ancestorType, ancestorId ]
    });
  }

  update( model ) {
    return this.qouch.update(model.toJSON(true));
  }

  delete( model ) {
    this.qouch.destroy(model.toJSON(true));
  }

  // CouchDB-specific methods. Kudu database adapters must implement all of the
  // methods listed above. Any listed below are unique to CouchDB.

  getFromView( design = '', view = '', config = {} ) {
    return this.qouch.viewDocs(design, view, config)
    .then(( docs ) => docs.map(this.config.documentToModel));
  }
}
