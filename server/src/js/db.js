import mongodb from 'mongodb';

let client = null;
let db = null;

function get_client_url() {
  return 'mongodb://127.0.0.1:27017';
}

async function get_client() {
  if(client == null) {
    client = new mongodb.MongoClient(get_client_url());
    await client.connect();
    console.log(`Connected to MongoDB server`);
  }
  return client;
}

async function get_db() {
  if(db == null) {
    const client = await get_client();
    db = client.db('recordscratch');

    const users = db.collection('users');
    //await users.dropIndexes();
    await users.createIndex('email', {
      unique: true,
    });

    const tracks = db.collection('tracks');
    //await tracks.dropIndexes();
    await tracks.createIndex('hash', {
      unique: true,
    });

    console.log(`Set up MongoDB database`);
  }
  return db;
}

async function get_collection(name) {
  const db = await get_db();
  return db.collection(name);
}

export default {
  get_collection: get_collection,
}
