const express = require("express");
const router = express.Router();
const User = require('../models/users');
const Event = require('../models/events');
const { v4: uuidV4 } = require('uuid');

router.get('/getPageEvents', (req, res) => {

    const apiKey = req.query.apiKey;
    const projectId = req.query.projectId;
    const pageId = req.query.pageId;

    User.findOne({ apiKey: apiKey }, '_id', (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let userId = doc._id;

            Event.find({ userId: userId, projectId: projectId, pageId: pageId }, (err, doc) => {
                if(err) {
                    res.json({ status: 'failed', error: err });
                } 
                if(doc == null){
                    res.json({ status: 'success', events: [] });
                }else{
                    res.json({ status: 'success', events: doc });
                }
            });
        }
    });
});

router.post('/createEvent', (req, res) => {

    const name = req.body.name;
    const description = req.body.description;
    const apiKey = req.body.apiKey;
    const projectId = req.body.projectId;
    const pageId = req.body.pageId;

    User.findOne({ apiKey: apiKey }, '_id', async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            let userId = doc._id;

            const event = new Event({
                userId: userId,
                projectId: projectId,
                pageId: pageId,
                eventKey: uuidV4(),
                name: name,
                description: description
            });

            try{
                await event.save();
                res.json({ status: 'success' });
            }catch(err){
                res.json({ status: 'failed', error: err });
            }
        }
    });
});

module.exports = router;