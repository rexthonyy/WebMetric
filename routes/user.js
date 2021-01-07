const express = require("express");
const router = express.Router();
const User = require('../models/users');
const { v4: uuidV4 } = require('uuid');
const EmailVerification = require('../models/emailVerification');
const Project = require('../models/projects');
const util = require('../libs/util');

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

router.post('/updateProfile', (req, res) => {

    const email = req.body.email;
    const name = req.body.name;
    const apiKey = req.body.apiKey;

    User.findOne({ apiKey: apiKey }, (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
            return;
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Not found'});
        }else{

            let isUpdate = false;
            let isSendEmail = false;

            if(doc.username !== name){
                isUpdate = true;
                doc.username = name;
            }

            if(doc.email !== email){
                isUpdate = true;
                isSendEmail = true;
            }

            //if the same data is uploaded, don't touch the database
            if(!isUpdate){
                res.json({ status: 'success', user: doc });
                return;
            }

            //if only the name is set, save it
            if(!isSendEmail){
                updateProfile(res, doc);
            }else{ //if the email is about to change, send an email
                sendUpdateProfileEmailTo(doc, email, isSent => {
                    if(!isSent){
                        res.json({ status: 'failed', error: 'Failed to send transfer email'});
                    }else{
                        doc.email = email;
                        updateProfile(res, doc);
                    }
                });
            }
        }
    });
});

function updateProfile(res, doc){
    doc.save()
    .then(newUser => res.json({ status: 'success', user: newUser }))
    .catch(err => res.json({ status: 'failed', error: 'Failed to update profile'}));
}

function sendUpdateProfileEmailTo(user, email, callback){
    let currentDate = new Date();
    let fullYear = currentDate.getFullYear();

    //send user email
    let name = "WebMetric";
    let from = "webmetricapp@gmail.com";
    let to = user.email;
    let subject = "Your Web Metric Email Has Been Changed";
    let message = `
    <table width='100%' border='0'>
    <thead>
    <tr>
    <th style='padding:30px 30px; border:1px solid black; color:black; font-size:2em; font-family:Verdana;'>${name}</th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td style='padding:30px 30px; color:rgb(50, 50, 50); font-family:Verdana; line-height:1.8em; font-size:1em;'>

    Hi <b>${user.username}</b>,

    <br/></br>The request to change your email address was successful. Your Web Metric email is now <b>${email}</b>.

    <br/><br/>
    If you do not recognise this activity, please immediately contact the Web Metric support team <a href="mailto:webmetricapp@gmail.com">here</a>
    to secure your account.

    <br/><br/>
    Thanks,
    <br/>Support Team, WebMetric

    </td>
    </tr>
    </tbody>
    <tfoot>
    <tr>
    <td style='padding:30px 30px; border:1px solid black; font-size:0.8em; color:gray; font-family:Verdana; text-align: center;'>&copy; ${fullYear} All Rights reserved.</td>
    </tr>
    </tfoot>
    </table>
    `;

    let data = { 
        name: name,
        from: from,
        to: to,
        subject: subject,
        message: message 
    };

    let url = "http://rexthonyy.000webhostapp.com/apps/personal/EmailSender/sendEmailJSRequest.php";

    util.sendPostRequest(url, data)
    .then(json => {
        if(json.status == 'success'){
            callback(true);
        }else{
            callback(false);
        }
    }).catch(err => {
        console.error(err);
        callback(false);
    });
}

router.post('/sendEmailVerification', checkExpiredCode, (req, res) => {

    const email = req.body.email;

    EmailVerification.find({ type: 'emailVerification', email: email }, (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err});
        }
        if(doc != null){
            //delete the duplicate emails
            doc.forEach(element => {
                element.remove();
            });
        }

        //Create code
        let code = Math.floor(util.getRandom(100000, 999999));

        //Send email
        sendVerificationCodeEmailTo(email, code, async isSent => {
            if(!isSent){
                res.json({ status: 'failed', error: 'Failed to send verification code'});
            }else{
                // Record the new verification to the database
                const vItem = new EmailVerification({
                    type: 'emailVerification',
                    email: email,
                    code: code,
                    expire: Date.now()
                });

                try{
                    await vItem.save();
                    res.status(201).json({ status: 'success'});
                }catch(err){
                    res.status(500).json({ status: 'failed', error: 'Failed to log email'});
                }
            }
        });
    });
});

router.post('/verifyEmail', checkExpiredCode, (req, res) => {

    let code = req.body.code;
    let email = req.body.email;

    EmailVerification.findOne({ type: 'emailVerification', email: email, code: code}, (err, doc) => {
        if(err){
            res.json( { status: 'failed', error: err});
        }
        if(doc == null){
            res.json({ status: 'failed', error: 'Invalid code' });
        }else{
            doc.remove();
            res.json({ status: 'success' });
        }
    });
});

router.post('/changePassword', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;

    User.findOne({ email: email }, async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err});
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Email is not registered'});
        }else{
            doc.password = password;

            let user = null;

            try{
                user = await doc.save();
                sendChangePasswordEmailTo(email, user, isSent => {});
                res.json({ status: 'success', user: user });
            }catch(err){
                res.status(400).json({ status: 'failed', error: 'Failed to change password'});
            }

        }
    });
});

router.post('/regenerateAPIKey', (req, res) => {

    let apiKey = req.body.apiKey;

    User.findOne({ apiKey: apiKey }, async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err});
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'User not found'});
        }else{
            doc.apiKey = uuidV4();

            try{
                user = await doc.save();
                res.json({ status: 'success', user: user });
            }catch(err){
                res.status(400).json({ status: 'failed', error: 'Failed to regenerate API Key'});
            }
        }
    });
});

router.post('/closeAccount', (req, res) => {

    let email = req.body.email;
    let password = req.body.password;
    let apiKey = req.body.apiKey;

    User.findOne({ email: email, password: password, apiKey: apiKey }, async (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err});
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'User not found'});
        }else{
            // close all smaller subcategories

            // delete the projects
            deleteAllProjects(req, res, doc);

            // delete the user
            doc.remove();

            res.json({ status: 'success' });
        }
    });
});

function deleteAllProjects(req, res, user){
    Project.find({ userId: user._id }, (err, doc) => {
        if(err) {
            res.json(err);
        }
        if(doc != null){
            //delete all projects
            doc.forEach(element => {
               element.remove();
            });
        }
    });
}

function sendChangePasswordEmailTo(email, user, callback){
    
    let currentDate = new Date();
    let fullYear = currentDate.getFullYear();

    //send user email
    let name = "Web Metric";
    let from = "webmetricapp@gmail.com";
    let to = email;
    let subject = "Your password was changed";
    let message = `
    <table width='100%' border='0'>
    <thead>
    <tr>
    <th style='padding:30px 30px; border:1px solid black; color:black; font-size:2em; font-family:Verdana;'>${name}</th>
    </tr>
    </thead>
    <tbody>
    <tr>
    <td style='padding:30px 30px; color:rgb(50, 50, 50); font-family:Verdana; line-height:1.8em; font-size:1em;'>

    Hi <b>${user.username}</b>,

    <br/></br>Your WebMetric password has been successfully changed.

    <br/><br/>
    If you do not recognise this activity, please immediately contact the Web Metric support team 
    <a href="mailto:webmetricapp@gmail.com">here</a> to secure your account.

    <br/><br/>
    Thanks,
    <br/>Support Team, Web Metric

    </td>
    </tr>
    </tbody>
    <tfoot>
    <tr>
    <td style='padding:30px 30px; border:1px solid black; font-size:0.8em; color:gray; font-family:Verdana; text-align: center;'>&copy; ${fullYear} All Rights reserved.</td>
    </tr>
    </tfoot>
    </table>
    `;

    let data = { 
        name: name,
        from: from,
        to: to,
        subject: subject,
        message: message 
    };

    util.sendPostRequest(util.getSendEmailUrl(), data)
    .then(json => {
        if(json.status == 'success'){
            callback(true);
        }else{
            callback(false);
        }
    }).catch(err => {
        console.error(err);
        callback(false);
    });
}

function sendVerificationCodeEmailTo(email, code, callback){

    let currentDate = new Date();
    let fullYear = currentDate.getFullYear();

    //send user email
    let name = "WebMetric";
    let from = "webmetricapp@gmail.com";
    let to = email;
    let subject = `${code} is your verification code`;
    let message = `
    <table width='100%' border='0'>
        <thead>
            <tr>
                <th style='padding:30px 30px; border:1px solid black; color:black; font-size:2em; font-family:Verdana;'>${name}</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style='padding:30px 30px; color:rgb(50, 50, 50); font-family:Verdana; line-height:1.8em; font-size:1em;'>
                
                Hi,

                <br/></br>Your verification code is <b>${code}</b>.

                <br/><br/>
                If this email was sent to you by mistake, please ignore it. 
                If you do not recognise this activity, please visit your Web Metric account
                to secure your account.

                <br/><br/>
                Thanks,
                <br/>Support Team, WebMetric

                </td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td style='padding:30px 30px; border:1px solid black; font-size:0.8em; color:gray; font-family:Verdana; text-align: center;'>&copy; ${fullYear} All Rights reserved.</td>
            </tr>
        </tfoot>
    </table>
    `;
        
    let data = { 
        name: name,
        from: from,
        to: to,
        subject: subject,
        message: message 
    };

    util.sendPostRequest(util.getSendEmailUrl(), data)
    .then(json => {
        if(json.status == 'success'){
            callback(true);
        }else{
            callback(false);
        }
    }).catch(err => {
        console.error(err);
        callback(false);
    });
}

function checkExpiredCode(req, res, next) {
    EmailVerification.find({ }, 'expire', (err, doc) => {
        if(err) {
            res.json(err);
        }
        if(doc != null){
            //delete expired emails
            doc.forEach(element => {
                let expire = element.expire;
                let now = Date.now();
                let expirationTime = 1000 * 60 * 30;

                if(now > (expire + expirationTime)){
                    console.log("Removed expired verification item");
                    element.remove();
                }
            });
        }
    });

    next();
}

module.exports = router;