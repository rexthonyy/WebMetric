const express = require("express");
const router = express.Router();
const User = require('../models/users');

//input=apiKey output=user object
router.get('/getUser', (req, res) => {

    const apiKey = req.query.apiKey;

    User.findOne({ apiKey: apiKey }, (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{
            res.json({ status: 'success', user: doc });
        }
    });
});

module.exports = router;