const { ObjectId } = require('mongodb');
const { getDb } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

const SubmissionSchema = {
  assignmentId: { required: true },
  studentId: { required: true },
  timestamp: { required: true },
  content: { required: true }, // Assuming content is a field for submissions
  filename: { required: false }, // Assuming filename is a field for file submissions
  grade:{required:false}
};
exports.SubmissionSchema = SubmissionSchema;

async function insertNewSubmission(submission) {
  submission = extractValidFields(submission, SubmissionSchema);
  const db = getDb();
  const collection = db.collection('submissions');
  const result = await collection.insertOne(submission);
  return result.insertedId;
}
exports.insertNewSubmission = insertNewSubmission;

async function getSubmissionById(id) {
  const db = getDb();
  const collection = db.collection('submissions');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const submission = await collection.findOne({ _id: new ObjectId(id) });
    return submission;
  }
}
exports.getSubmissionById = getSubmissionById;

async function updateSubmissionById(id, updates) {
  const db = getDb();
  const collection = db.collection('submissions');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  return result.modifiedCount > 0;
}
exports.updateSubmissionById = updateSubmissionById;
async function getSubmissionsByAssignmentId(assignmentId, page, pageSize) {
  const db = getDb();
  const collection = db.collection('submissions');

  // Calculate the number of documents to skip
  const skip = (page - 1) * pageSize;

  // Get the total count of documents
  const totalCount = await collection.countDocuments({ assignmentId: new ObjectId(assignmentId) });

  // Fetch the paginated documents
  const submissions = await collection.find({ assignmentId: new ObjectId(assignmentId) })
      .skip(skip)
      .limit(pageSize)
      .toArray();

  return { submissions, totalCount };
}
exports.getSubmissionsByAssignmentId = getSubmissionsByAssignmentId;



async function getSubmissionByFilename(filename) {
  const db = getDb();
  const collection = db.collection('submissions');
  const submission = await collection.findOne({ filename: filename });
  return submission;
}
exports.getSubmissionByFilename = getSubmissionByFilename;

module.exports = {
  SubmissionSchema,
  insertNewSubmission,
  getSubmissionById,
  updateSubmissionById,
  getSubmissionsByAssignmentId,
  getSubmissionByFilename
};
