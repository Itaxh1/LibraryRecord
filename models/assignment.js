const { ObjectId } = require('mongodb');
const { getDb } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const AssignmentSchema = {
  courseId: { required: true },
  title: { required: true },
  description: { required: false },
  due: { required: true },
  points:{required : true}
};
exports.AssignmentSchema = AssignmentSchema;

async function insertNewAssignment(assignment) {
  assignment = extractValidFields(assignment, AssignmentSchema);
  const db = getDb();
  const collection = db.collection('assignments');
  const result = await collection.insertOne(assignment);
  return result.insertedId;
}
exports.insertNewAssignment = insertNewAssignment;

async function getAssignmentById(id) {
  const db = getDb();
  const collection = db.collection('assignments');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const assignment = await collection.findOne({ _id: new ObjectId(id) });
    return assignment;
  }
}
exports.getAssignmentById = getAssignmentById;


async function getAssignmentByCourseId(id) {
  const db = getDb();
  const collection = db.collection('assignments');

  if (!ObjectId.isValid(id)) {
    return null;
  }

  const courseId = new ObjectId(id);
  const assignments = await collection.find({ courseId: courseId }).toArray();

  return assignments;
}

exports.getAssignmentByCourseId = getAssignmentByCourseId;

async function updateAssignmentById(id, updates) {
  const db = getDb();
  const collection = db.collection('assignments');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  return result.modifiedCount > 0;
}
exports.updateAssignmentById = updateAssignmentById;

async function deleteAssignmentById(id) {
  const db = getDb();
  const collection = db.collection('assignments');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
exports.deleteAssignmentById = deleteAssignmentById;

// Other assignment functions...
