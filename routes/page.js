const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Page = require('../models/pages');
const Event = require('../models/events');

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

            Page.find({ userId: userId, projectId: projectId }, '_id name projectId', (err, doc) => {
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

router.post('/updatePage', (req, res) => {

    const pageName = req.body.pageName;
    const projectId = req.body.projectId;
    const apiKey = req.body.apiKey;
    const pageId = req.body.pageId;

    User.findOne({ apiKey: apiKey }, '_id',(err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
            return;
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'User not found'});
        }else{
            const userId = doc._id;

            Page.findOne({ _id: pageId, userId: userId, projectId: projectId  }, '_id projectId name', async (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                    return;
                } 
                if(doc == null){
                    res.json({ status: 'failed', error: 'Page not found'});
                }else{
                    doc.name = pageName;
                    try{
                        const page = await doc.save();
                        res.json({ status: 'success', page: page});
                    }catch(err){
                        res.status(400).json({ status: 'failed', error: 'Failed to update page'});
                    }
                }
            });
        }
    });
});


router.post('/deletePage', (req, res) => {

    const pageId = req.body.pageId;
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
            const userId = doc._id;
            
            //find other project dependencies and delete them here
            Event.find({ pageId: pageId, projectId: projectId, userId: userId }, async (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                    return;
                } 
                if(doc != null){
                    doc.forEach(event => {
                        event.remove();
                    });
                }

                Page.findOne({ _id: pageId, userId: userId }, async (err, doc) => {
                    if(err) {
                        res.json({ status: 'failed', error: err });
                        return;
                    } 
                    if(doc == null){
                        res.json({ status: 'failed', error: 'Page not found'});
                    }else{
                        doc.remove();
                        res.json({ status: 'success' });
                    }
                });
            });
        }
    });
});
module.exports = router;