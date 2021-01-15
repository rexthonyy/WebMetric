const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Project = require('../models/projects');

//input=apiKey output=projects array
router.get('/getUserProjects', (req, res) => {

    const apiKey = req.query.apiKey;

    User.findOne({ apiKey: apiKey }, '_id', (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let id = doc._id;

            Project.find({ userId: id }, '_id name', (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                } 
                if(doc == null){
                    res.json({ status: 'success', projects: [] });
                }else{
                    res.json({ status: 'success', projects: doc });
                }
            });
        }
    });
});

router.post('/createProject', (req, res) => {

    const name = req.body.name;
    const apiKey = req.body.apiKey;

    User.findOne({ apiKey: apiKey }, '_id', async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let id = doc._id;

            const project = new Project({
                userId: id,
                name: name
            });

            try{
                await project.save();
                res.json({ status: 'success' });
            }catch(err){
                res.json({ status: 'failed', error: err });
            }
        }
    });
});

router.post('/updateProject', (req, res) => {

    const projectId = req.body.projectId;
    const projectName = req.body.projectName;
    const apiKey = req.body.apiKey;

    User.findOne({ apiKey: apiKey }, '_id',(err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
            return;
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'User not found'});
        }else{
            Project.findOne({ _id: projectId, userId: doc._id }, '_id name', async (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                    return;
                } 
                if(doc == null){
                    res.json({ status: 'failed', error: 'Project not found'});
                }else{
                    doc.name = projectName;
                    try{
                        project = await doc.save();
                        res.json({ status: 'success', project: project});
                    }catch(err){
                        res.status(400).json({ status: 'failed', error: 'Failed to update project'});
                    }
                }
            });
        }
    });
});

router.post('/deleteProject', (req, res) => {

    const projectId = req.body.projectId;
    const apiKey = req.body.apiKey;

    User.findOne({ apiKey: apiKey }, '_id',(err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
            return;
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'User not found'});
        }else{
            //find other project dependencies and delete them here
            Project.findOne({ _id: projectId, userId: doc._id }, async (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                    return;
                } 
                if(doc == null){
                    res.json({ status: 'failed', error: 'Project not found'});
                }else{
                    doc.remove();
                    res.json({ status: 'success' });
                }
            });
        }
    });
});


module.exports = router;