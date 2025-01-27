// const express = require('express');
// const path = require('path');
// const fs = require('fs');
// const Jimp = require('jimp');
// const multer = require('multer');
// const crypto = require('crypto');
// const { ObjectId } = require('mongodb');
// const { insertNewPhoto } = require('../models/photo'); // Importing the Photo model methods
// const { publishMessage } = require('../producer'); // Importing from producer.js
// const uploadImage = require('./upload');
// const { getDb } = require('../lib/mongo')
// const router = express.Router();

// const imageTypes = {
//   "image/jpeg": "jpg",
//   "image/png": "png",
//   "image/gif": "gif"
// };

// const uploadsPath = path.join(__dirname, '../uploads');
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: uploadsPath,
//     filename: (req, file, callback) => {
//       const filename = crypto.randomBytes(16).toString("hex");
//       const extension = imageTypes[file.mimetype];
//       callback(null, `${filename}.${extension}`);
//     }
//   }),
//   fileFilter: (req, file, callback) => {
//     callback(null, !!imageTypes[file.mimetype]);
//   }
// }).single('image');


// function defineModel() {
//   var ItemSchema = new Schema({
//     img: { data: Buffer, contentType: String }
//   });
//   return mongoose.model('Item', ItemSchema);
// }


// function configureMulter() {
//   var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, './uploads/');
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.fieldname + '-' + Date.now());
//     }
//   });
//   return multer({ storage: storage }).single('userPhoto');
// }


// //Update the busniess Data files
// async function updateBusiness(updateData, BusinessId) {
//   try {
//     const db = getDb();  // Assuming getDb() function retrieves the database connection
//     const collection = db.collection('businesses');

//     const query = { '_id': new ObjectId(BusinessId) };
//     const result = await collection.updateOne(
//       query,  // Filter: find document with this businessId
//       updateData,  // Update: set fields as specified in updateData
//       { returnOriginal: false }  // Options: return the updated document
//     );

//     // Process the updated document (result.value) here
//     console.log('Updated document:', result);
//   } catch (err) {
//     console.error('Error updating document:', err);
//     // Handle error, return or do something
//   }
// }




// // Serve static files from the correct path
// router.use('/media/photos', express.static(uploadsPath));


// router.post('/', upload, async (req, res) => {
//   const { userId, businessId, caption } = req.body;
//   const file = req.file;
//   uploadImage(req, res);
//   if (!file) {
//     return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
//   }

//   try {
//     const photo = {
//       userId,
//       businessId,
//       caption: caption || '',
//       filename: file.filename,
//       path: file.path,
//       contentType: file.mimetype,
//       downlaodLink: 'http://localhost:8000/photos/media/thumbs/' + file.filename
//     };

//     // Create thumbs directory if it doesn't exist
//     const thumbsDir = path.join(__dirname, '../thumbs');
//     if (!fs.existsSync(thumbsDir)) {
//       fs.mkdirSync(thumbsDir);
//     }

//     // Generate thumbnail
//     const thumbnailPath = path.join(thumbsDir, `${path.basename(file.filename, path.extname(file.filename))}.jpg`);
//     const image = await Jimp.read(file.path);
//     await image
//       .resize(100, 100) // Resize
//       .quality(60) // Set JPEG quality
//       .writeAsync(thumbnailPath); // Save

//     // Update photo with thumbnail path
//     photo.thumbnailPath = thumbnailPath;

//     // Insert new photo into the database
//     const photoId = await insertNewPhoto(photo);



//     const updateData = {
//       $set: {

//         downlaodLink: 'http://localhost:8000/photos/media/thumbs/' + file.filename,
//         filename: file.filename,

//       }
//     };

//     updateBusiness(updateData, businessId);
//     // Publish message to RabbitMQ (if needed)
//     publishMessage({ ...photo, _id: photoId });

//     res.status(201).json({ ...photo, _id: photoId });
//   } catch (error) {
//     console.error('Error', error);
//     res.status(500).json({ error: 'An error occurred while processing the image.' });
//   }
// });


// router.get('/media/thumbs/:filename', async (req, res) => {
//   const uploadsPath = path.join(__dirname, '../thumbs', req.params.filename);
//   console.log("File path:", uploadsPath);

//   // Check if the file exists
//   fs.access(uploadsPath, fs.constants.F_OK, (err) => {
//     if (err) {
//       console.log("File Not found");
//       return res.status(404).send("File Not Found");
//     }

//     // File exists, initiate download
//     res.download(uploadsPath, req.params.filename, (err) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error Downloading File");
//       } else {
//         console.log("File downloaded Successfully");
//       }
//     });
//   });
// });


// router.get('/media/thumbs/:filename', async (req, res) => {
//   const uploadsPath = path.join(__dirname, '../thumbs', req.params.filename);
//   console.log("File path:", uploadsPath);

//   // Check if the file exists
//   fs.access(uploadsPath, fs.constants.F_OK, (err) => {
//     if (err) {
//       console.log("File Not found");
//       return res.status(404).send("File Not Found");
//     }

//     // File exists, initiate download
//     res.download(uploadsPath, req.params.filename, (err) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error Downloading File");
//       } else {
//         console.log("File downloaded Successfully");
//       }
//     });
//   });
// });

// module.exports = router;
