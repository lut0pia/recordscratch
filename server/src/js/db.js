'use strict';

const mongodb = require('mongodb');

let client = null;
let db = null;

module.exports.get_client_url = () => {
  return 'mongodb://127.0.0.1:27017';
}

module.exports.get_client = async () => {
  if(client == null) {
    client = new mongodb.MongoClient(this.get_client_url());
    await client.connect();
  }
  return client;
}

module.exports.get_db = async () => {
  if(db == null) {
    const client = await this.get_client();
    db = client.db('recordscratch');
  }
  return db;
}

module.exports.get_collection = async (name) => {
  const db = await this.get_db();
  return db.collection(name);
}
