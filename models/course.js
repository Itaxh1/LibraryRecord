const { ObjectId } = require('mongodb');
const { getDb } = require('../lib/mongo');
const { extractValidFields } = require('../lib/validation');

/*
 * Schema describing required/optional fields of a course object.
 */
const CourseSchema = {
    subject: { required: true },
    number: { required: true },
    title: { required: true },
    term: { required: true },
    instructorId: { required: true } // Assuming instructorId is a reference to a user
};
exports.CourseSchema = CourseSchema;

/*
 * Executes a DB query to return a single page of courses. Returns a
 * Promise that resolves to an object containing the fetched page of courses.
 */
async function getCoursesPage(page) {
    const db = getDb();
    const collection = db.collection('courses');
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
        courses: results,
        page: page,
        totalPages: lastPage,
        pageSize: pageSize,
        count: count
    };
}
exports.getCoursesPage = getCoursesPage;

/*
 * Executes a DB query to insert a new course into the database. Returns
 * a Promise that resolves to the ID of the newly-created course entry.
 */
async function insertNewCourse(course) {
    course = extractValidFields(course, CourseSchema);
    const db = getDb();
    const collection = db.collection('courses');
    const result = await collection.insertOne(course);
    return result.insertedId;
}
exports.insertNewCourse = insertNewCourse;

/*
 * Executes a DB query to fetch detailed information about a single
 * specified course based on its ID. Returns a Promise that resolves
 * to an object containing information about the requested course.
 * If no course with the specified ID exists, the returned Promise will resolve to null.
 */
async function getCourseById(id) {
    const db = getDb();
    const collection = db.collection('courses');
    if (!ObjectId.isValid(id)) {
        return null;
    } else {
        const course = await collection.findOne({ _id: new ObjectId(id) });
        return course;
    }
}
exports.getCourseById = getCourseById;

/*
 * Executes a DB query to update information about a specified course based on its ID.
 * Returns a Promise that resolves to a boolean indicating whether the course was updated.
 */
async function updateCourseById(id, updates) {
    const db = getDb();
    const collection = db.collection('courses');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updates }
    );
    return result.modifiedCount > 0;
}
exports.updateCourseById = updateCourseById;

/*
 * Executes a DB query to delete a specified course based on its ID.
 * Returns a Promise that resolves to a boolean indicating whether the course was deleted.
 */
async function deleteCourseById(id) {
    const db = getDb();
    const collection = db.collection('courses');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}
exports.deleteCourseById = deleteCourseById;


async function getStudentsByCourseId(courseId) {
    const db = getDb();
    const collection = db.collection('users');
    const students = await collection.find({ enrolledCourses: new ObjectId(courseId) }).toArray(); // Assuming 'enrolledCourses' is an array of course IDs in the user document
    return students;
  }
  exports.getStudentsByCourseId = getStudentsByCourseId;

  

  async function updateCourseEnrollment(courseId, updates) {
    const db = getDb();
    const collection = db.collection('users');
    // Assuming updates contain an array of student IDs to enroll/unenroll
    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: new ObjectId(update.studentId) },
        update: { $addToSet: { enrolledCourses: new ObjectId(courseId) } }
      }
    }));
  
    const result = await collection.bulkWrite(bulkOps);
    return result.modifiedCount > 0;
  }
  exports.updateCourseEnrollment = updateCourseEnrollment;

  
  async function updateCourseById(id, updates) {
    const db = getDb();
    const collection = db.collection('courses');
    // Prevent updates to enrolled students and assignments fields
    delete updates.enrolledStudents;
    delete updates.assignments;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return result.modifiedCount > 0;
  }
  exports.updateCourseById = updateCourseById;

  