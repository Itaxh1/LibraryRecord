const { ObjectId } = require('mongodb');
const { getDb } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

// Schema describing required/optional fields of an enrollment object.
const EnrollmentSchema = {
  courseId: { required: true },
  courseName:{required:true},
  userId: { required: true },
  role: { required: true },
  joinedDate: { required: true },
  instructorId: {required:true}
};
exports.EnrollmentSchema = EnrollmentSchema;

/*
 * Executes a DB query to insert a new enrollment into the database. Returns
 * a Promise that resolves to the ID of the newly-created enrollment entry.
 */
async function insertNewEnrollment(enrollment) {
    enrollment = extractValidFields(enrollment, EnrollmentSchema);
    const db = getDb();
    const collection = db.collection('enrollments');
  
    // Check for duplicates
    const existingEnrollment = await collection.findOne({
        courseId: enrollment.courseId,
        userId: enrollment.userId,
        role: enrollment.role
      });
    
    
    console.log(existingEnrollment)
    if (existingEnrollment) {
      throw new Error('Duplicate enrollment found');
    }
  
    const result = await collection.insertOne(enrollment);
    return result.insertedId;
  }
  exports.insertNewEnrollment = insertNewEnrollment;


  exports.insertNewEnrollment = insertNewEnrollment;

    async function removeEnrollment(courseId, userId) {
    const db = getDb();
    const collection = db.collection('enrollments');
    
    const result = await collection.deleteOne({
        courseId: new ObjectId(courseId),
        userId: new ObjectId(userId)
    });

    return result.deletedCount > 0;
    }

    exports.removeEnrollment = removeEnrollment;

/*
 * Executes a DB query to fetch detailed information about a single
 * specified enrollment based on its ID. Returns a Promise that resolves
 * to an object containing information about the requested enrollment.
 * If no enrollment with the specified ID exists, the returned Promise will resolve to null.
 */
async function getEnrollmentById(id) {
  const db = getDb();
  const collection = db.collection('enrollments');
  if (!ObjectId.isValid(id)) {
    return null;
  } else {
    const enrollment = await collection.findOne({ _id: new ObjectId(id) });
    return enrollment;
  }
}
exports.getEnrollmentById = getEnrollmentById;

/*
 * Executes a DB query to return a single page of enrollments. Returns a
 * Promise that resolves to an object containing the fetched page of enrollments.
 */
async function getEnrollmentsPage(page) {
  const db = getDb();
  const collection = db.collection('enrollments');
  const count = await collection.countDocuments();

  const pageSize = 10;
  const lastPage = Math.ceil(count / pageSize);
  page = page > lastPage ? lastPage : page;
  page = page < 1 ? 1 : page;
  const offset = (page - 1) * pageSize;

  const results = await collection.find({})
    .sort({ _id: 1 })
    .skip(offset)
    .limit(pageSize)
    .toArray();

  return {
    enrollments: results,
    page: page,
    totalPages: lastPage,
    pageSize: pageSize,
    count: count
  };
}
exports.getEnrollmentsPage = getEnrollmentsPage;

/*
 * Executes a DB query to update information about a specified enrollment based on its ID.
 * Returns a Promise that resolves to a boolean indicating whether the enrollment was updated.
 */
async function updateEnrollmentById(id, updates) {
  const db = getDb();
  const collection = db.collection('enrollments');
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: updates }
  );
  return result.modifiedCount > 0;
}
exports.updateEnrollmentById = updateEnrollmentById;

/*
 * Executes a DB query to delete a specified enrollment based on its ID.
 * Returns a Promise that resolves to a boolean indicating whether the enrollment was deleted.
 */
async function deleteEnrollmentById(id) {
  const db = getDb();
  const collection = db.collection('enrollments');
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount > 0;
}
exports.deleteEnrollmentById = deleteEnrollmentById;

/*
 * Executes a DB query to fetch enrollments by course ID. Returns a Promise that resolves
 * to an array containing the enrollments for the specified course.
 */
async function getEnrollmentsByCourseId(courseId) {
  const db = getDb();
  const collection = db.collection('enrollments');
  const enrollments = await collection.find({ courseId: new ObjectId(courseId) }).toArray();
  return enrollments;
}
exports.getEnrollmentsByCourseId = getEnrollmentsByCourseId;

/*
 * Executes a DB query to fetch enrollments by user ID. Returns a Promise that resolves
 * to an array containing the enrollments for the specified user.
 */
async function getEnrollmentsByInstructor(InstructorID) {
    const db = getDb();

    const collection = db.collection('enrollments');
    const enrollments = await collection.find({ instructorId: InstructorID }).toArray();
    return enrollments;
  }
  exports.getEnrollmentsByInstructor = getEnrollmentsByInstructor;

  async function getEnrollmentsByCourseWithUserDetails(courseId) {
    const db = getDb();
    const enrollmentCollection = db.collection('enrollments');
    const userCollection = db.collection('users');
    console.log(courseId);
    if (!ObjectId.isValid(courseId)) {
      throw new Error('Invalid courseId');
    }
  
    // Fetch all enrollments for the given course ID
    const enrollments = await enrollmentCollection.find({ courseId: new ObjectId(courseId) }).toArray();
    if (enrollments.length === 0) {
      return [];
    }
  
    // Fetch user details for each enrolled student
    const userIds = enrollments.map(enrollment => new ObjectId(enrollment.userId));
    const users = await userCollection.find({ _id: { $in: userIds } }).toArray();
   
    // Merge enrollment and user details
    const mergedDetails = enrollments.map(enrollment => {
      const user = users.find(user => user._id.equals(enrollment.userId));
      delete user.password;
      return { ...enrollment, user };
    });
  
    return mergedDetails;
  }

  exports.getEnrollmentsByCourseWithUserDetails = getEnrollmentsByCourseWithUserDetails;

  async function getCoursesByStudentId(studentId) {
    const db = getDb();
    const collection = db.collection('enrollments');
    const enrollments = await collection.find({ userId: studentId }).toArray();
    console.log(enrollments);	   
    return enrollments;
  }
  exports.getCoursesByStudentId=getCoursesByStudentId,
  
  async function getEnrollmentsByInstructor(instructorId) {
    const db = getDb();
    const collection = db.collection('enrollments');
    const enrollments = await collection.find({ instructorId: instructorId }).toArray();
    return enrollments;
  }
  
    exports.getEnrollmentsByInstructor=getEnrollmentsByInstructor;

  
