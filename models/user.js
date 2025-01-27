const { ObjectId } = require('mongodb');
const { getDb } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const UserSchema = {
  email: { required: true },
  password: { required: true },
  name: { required: true },
  role: { required: true }
};
exports.UserSchema = UserSchema;

async function getUserById(id) {
  const db = getDb();
  const collection = db.collection('users');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const user = await collection.findOne({ _id: new ObjectId(id) });
    return user;
  }
}
exports.getUserById = getUserById;

async function insertNewUser(user) {
  user = extractValidFields(user, UserSchema);
  const db = getDb();
  const collection = db.collection('users');
  const result = await collection.insertOne(user);
  return result.insertedId;
}
exports.insertNewUser = insertNewUser;

async function authenticateUser(email, password) {
  const db = getDb();
  const collection = db.collection('users');
  const user = await collection.findOne({ email: email, password: password });
  return user;
}
exports.authenticateUser = authenticateUser;
