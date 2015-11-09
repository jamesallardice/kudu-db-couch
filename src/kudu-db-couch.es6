import 'core-js/shim';
import CouchPromised from 'couch-promised';

let defaults = Symbol();

export default class CouchAdapter {

  get [ defaults ]() {
    return {
      views: {},
      documentToModel: ( doc ) => {

        // JSON API requires all documents to have an "id" property. CouchDB
        // uses "_id" internally so we need to rename it.
        if ( doc.id === undefined ) {
          doc.id = doc._id;
          delete doc._id;
        }

        return doc;
      },
      modelToDocument: ( model ) => {

        // Again, since JSON API requires "id" properties and CouchDB requires
        // "_id" we need to map that before we try to write our documents to
        // CouchDB.
        if ( model.id && model._id === undefined ) {
          model._id = model.id;
          delete model.id;
        }

        return model.toJSON(true);
      }
    };
  }

  constructor( config = {} ) {

    this.config = Object.assign({}, this[ defaults ], config);

    this.couch = new CouchPromised({
      host: config.host,
      port: config.port,
      path: config.path,
    });
  }

  create( model ) {
    return this.couch.insert(model.toJSON(true))
    .then(( res ) => {

      // CouchDB responds with an object containing the new document _id and
      // _rev properties. We add them to the original object and return it.
      if ( model.id === undefined ) {
        model.id = res._id;
      }

      if ( model._rev === undefined ) {
        model._rev = res._rev;
      }

      return model;
    });
  }

  get( type, id ) {
    return this.couch.get(id)
    .then(( doc ) => this.config.documentToModel(doc));
  }

  getAll( Model, { max, offset } ) {

    let doc = this.config.views.types;

    if ( !doc ) {
      throw new Error('No CouchDB view configured for types.');
    }

    if ( typeof doc.design !== 'string' || typeof doc.view !== 'string') {
      throw new Error('Invalid CouchDB descendant types view.');
    }

    let viewOptions = {
      rootKey: [ Model.singular, ],
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
    return this.couch.update(this.config.modelToDocument(model))
    .then(( updatedDoc ) => this.config.documentToModel(updatedDoc));
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
