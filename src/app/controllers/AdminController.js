const AcademicYear = require("../models/AcademicYear");
const {mutipleMongooseToObjects,mongoseToObject}= require('../../util/mongoose')

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
        console.log("ACADEMIC",academicYear);
        academicYear.save();
        // res.send('AcademicYear saved')
        res.redirect('./view')

    }

    //[GET] /academic/view
    view(req, res,next) {
        AcademicYear.find({})
        .then(academicYears =>res.render('academicYear/view',{
            // activePage: 'home',
            academicYears : mutipleMongooseToObjects(academicYears),
            authen: true
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
