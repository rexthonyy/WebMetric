const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Page = require('../models/pages');

//input=apiKey output=projects array
router.get('/getProjectPages', (req, res) => {

    const apiKey = req.query.apiKey;
    const projectId = req.query.projectId;

    User.findOne({ apiKey: apiKey }, '_id', (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let userId = doc._id;

            Page.find({ userId: userId, projectId: projectId }, '_id name', (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                } 
                if(doc == null){
                    res.json({ status: 'success', pages: [] });
                }else{
                    res.json({ status: 'success', pages: doc });
                }
            });
        }
    });
});

router.post('/createPage', (req, res) => {

    const name = req.body.name;
    const apiKey = req.body.apiKey;
    const projectId = req.body.projectId;

    User.findOne({ apiKey: apiKey }, '_id', async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let userId = doc._id;

            const page = new Page({
                userId: userId,
                projectId: projectId,
                name: name
            });

            try{
                await page.save();
                res.json({ status: 'success' });
            }catch(err){
                res.json({ status: 'failed', error: err });
            }
        }
    });
});

module.exports = router;