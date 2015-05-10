import 'core-js/shim';
import CouchPromised from 'couch-promised';

let defaults = Symbol();

export default class CouchAdapter {

  get [ defaults ]() {
    return {
      views: {},
      documentToModel: ( doc ) => doc,
    };
  }

  constructor( kudu, config = {} ) {

    this.config = Object.assign({}, this[ defaults ], config);

    this.couch = new CouchPromised({
      host: config.host,
      port: config.port,
      path: config.path,
    });

    this.kudu = kudu;
  }

  create( model ) {
    return this.couch.insert(model.toJSON(true));
  }

  get( type, id ) {
    return this.qouch.get(id)
    .then(( doc ) => this.config.documentToModel(doc));
  }

  getAll( type, { max, offset } ) {

    let doc = this.config.views.types;

    if ( !doc ) {
      throw new Error('No CouchDB view configured for types.');
    }

    if ( typeof doc.design !== 'string' || typeof doc.view !== 'string') {
      throw new Error('Invalid CouchDB descendant types view.');
    }

    let viewOptions = {
      rootKey: [ type, ],
      include_docs: true,
    };

    if ( max ) {
      viewOptions.limit = max;
    }

    if ( offset ) {
      viewOptions.skip = offset;
    }

    return this.couch.view(doc.design, doc.view, viewOptions)
    .then(( res ) => {

      return {
        rows: res.rows.map(( row ) => this.config.documentToModel(row.doc)),
        totalRows: res.total_rows,
        offset: res.offset,
      };
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

    return this.couch.viewDocs(doc.design, doc.view, {
      key: [ descendantType, ancestorType, ancestorId, ]
    })
    .then(( docs ) => docs.map(( doc ) => this.config.documentToModel(doc)));
  }

  update( model ) {
    return this.couch.update(model.toJSON(true));
  }

  delete( model ) {
    this.couch.destroy(model.toJSON(true));
  }

  // CouchDB-specific methods. Kudu database adapters must implement all of the
  // methods listed above. Any listed below are unique to CouchDB.

  getFromView( design = '', view = '', config = {} ) {
    return this.couch.viewDocs(design, view, config)
    .then(( docs ) => docs.map(this.config.documentToModel));
  }
}
