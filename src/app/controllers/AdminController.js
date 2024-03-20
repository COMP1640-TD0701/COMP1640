const AcademicYear = require("../models/AcademicYear");
const {mutipleMongooseToObjects,mongoseToObject}= require('../../util/mongoose')
const nodemailer = require('nodemailer');

class AdminController {
    
    //[GET] /createAcademicYear
    createForm(req, res) {
        res.render('academicYear/create');
    }
    //[POST] /createAcademicYear
    create(req, res) {
        // console.log(req.params);
        // res.send(req.body);
        const academicYear = new AcademicYear(req.body);
        console.log(academicYear);
        academicYear.save();
        // res.send('AcademicYear saved')
         // Send email notification
        const transporter = nodemailer.createTransport({
            // Configure your email service settings here
            // For example, using Gmail SMTP:
            service: 'gmail',
            auth: {
                user: 'hieuntgcd201925@fpt.edu.vn',
                pass: 'qtuu cpxg ltny tiud',
            },
        });

        const mailOptions = {
            from: 'hieuntgcd201925@fpt.edu.vn',
            to: 'greenwichnotification@gmail.com', // Replace with the admin's email address
            subject: 'Academic Year Created',
            text: 'You have 14 days to reply.',
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });
        res.redirect('./view');
    }

    //[GET] /academic/view
    view(req, res,next) {
        AcademicYear.find({})
        .then(academicYears =>res.render('academicYear/view',{
            // activePage: 'home',
            academicYears : mutipleMongooseToObjects(academicYears)
        }))
        .catch(error => next(error))    }


    //[POST] /:id/delete
    delete(req, res,next) {
        AcademicYear.deleteOne({ _id: req.params.id })
            .then(() => res.redirect('../view'))
            .catch(error => next(error))
    }
    //[GET] /:id/edit
    edit(req, res, next) {
        AcademicYear.findById(req.params.id)
            .then(academicYear => res.render('academicYear/edit', {
                academicYear: mongoseToObject(academicYear)
            }))
            .catch(error => next(error))
    }
    //[POST] /:id/update
    update(req, res, next) {
        AcademicYear.updateOne({ _id: req.params.id }, req.body)
            .then(() => res.redirect('../view'))
            .catch(error => next(error))
    }
}
module.exports = new AdminController();
