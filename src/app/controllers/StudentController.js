const { mutipleMongooseToObjects, mongoseToObject } = require("../../util/mongoose");
const Student = require("../models/User");
const { upload, bucket, admin, getCachedViewLink } = require('../../config/firebase');
const Submission = require("../models/Submission")
const Magazine= require("../models/Magazine")
const Faculty = require("../models/Faculty")
const Role = require("../models/Role")
const { sendMail } = require('../../config/mailNotification');
const User = require("../models/User");

class StudentController {
    // [GET] /submission/create
    async getSubmissionForm(req, res, next) {
        try {

            const faculty = req.facultyId;
            const magazines = await Magazine.find({ faculty: faculty });

            // Render the submission form view with the fetched data
            res.render('submission/create', {
                authen: 'student',
                magazines: mutipleMongooseToObjects(magazines),
                activePage: "submission"
                // Example authentication check
                // Pass any data needed for rendering the form
            });
        } catch (error) {
            next(error);
        }
    }

    // [POST] /submission/create
    async submitFormData(req, res, next) {
        try {
            const user = req.userId;
            const faculty=await Faculty.findOne({_id:req.facultyId})
            // const faculty = req.facultyId;
            // const magazines = await Magazine.find({ faculty: faculty });
            const {title,magazine}= req.body;
            const { image, document } = req.files;
            // Check if both files are uploaded
            if (!image || !document) {
                return res.status(400).json({ message: 'Both image and document files are required' });
            }

            // Handle image file
            const imageFileName = Date.now() + image[0].originalname;
            const imageFileRef = bucket.file(imageFileName);

            await imageFileRef.save(image[0].buffer, {
                metadata: { contentType: image[0].mimetype }
            });

            // Handle document file
            const documentFileName = Date.now() + document[0].originalname;
            const documentFileRef = bucket.file(documentFileName);

            await documentFileRef.save(document[0].buffer, {
                metadata: { contentType: document[0].mimetype }
            });

            const imagePath = `${imageFileName}`;
            const documentPath = `${documentFileName}`;

            // const viewLinkImage = await getCachedViewLink(imagePath);
            // const viewLinkDocument = await getCachedViewLink(documentPath);

            const newSubmission = new Submission({ student: user, imagePath, documentPath,title,magazine});
            newSubmission.save();
            const roleCoordinator=await Role.findOne({name:'coordinator'})
            const roleCoordinatorId=roleCoordinator._id;

            const coordinators = await User.find({ roleId:roleCoordinatorId ,facultyId:faculty._id});
            
            // sendMail(req,coordinator.email,faculty.name,newSubmission._id)
            for (const coordinator of coordinators) {
                await sendMail(req, coordinator.email, faculty.name, newSubmission._id);
            }

            res.redirect ('./create');


        } catch (error) {
            next(error);
        }
    }


    async getAllSubmissions(req, res, next) {
        try {
            const faculty=await Faculty.findOne({_id:req.facultyId})
            const user = req.userId;
            const submissions = await Submission.find({ student: user })
            .populate({
                path: 'magazine',
                populate: [{ path: 'academicYear' }, { path: 'faculty' }]// Populate the academicYear field within the magazine
            });

            console.log(submissions)
            res.render('submission/view', {
                authen: 'student',
                submissions: mutipleMongooseToObjects(submissions),
                facultyName:faculty.name,
                activePage: "viewsubmission"
                // Pass any other data needed for rendering the view
            });
        } catch (error) {
            next(error);
        }
    }

}

module.exports = new StudentController();
