const express = require('express');
const router = express.Router();
const User = require('../models/users');
const EmailVerification = require('../models/emailVerification');
const util = require('../libs/util');

router.post('/', checkExpiredCode, (req, res) => {
	let email = req.body.email;
	let password = req.body.password;

	User.findOne({ email: email, password: password }, (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Login credentials incorrect'});
        }else{
        	res.json({ status: 'success', apiKey: doc.apiKey });
        }
    });
});


router.post('/forgottenPassword', checkExpiredCode, (req, res) => {
	sendVerifyCode(req, res);
	
});

router.post('/forgottenPassword/resendCode', checkExpiredCode, (req, res) => {
	sendVerifyCode(req, res);
});

router.post('/forgottenPassword/verifyCode', checkExpiredCode, (req, res) => {

	let code = req.body.code;
	let email = req.body.email;

	EmailVerification.findOne({ type: 'forgottenPassword', email: email, code: code}, (err, doc) => {
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

function sendVerifyCode(req, res){

	const email = req.body.email;

	//check user is signed up
    User.findOne({ email: email }, (err, doc) => {
        if(err) {
            res.json(err);
        } 
        if(doc == null){
            res.json({ status: 'failed', error: 'Email is not registered'});
        }else{
            EmailVerification.find({ type: 'forgottenPassword', email: email }, (err, doc) => {
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
                sendEmailTo(email, code, async isSent => {
                	if(!isSent){
						res.json({ status: 'failed', error: 'Failed to send verification code'});
                	}else{
						// Record the new verification to the database
						const vItem = new EmailVerification({
							type: 'forgottenPassword',
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
        }
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

function sendEmailTo(email, code, callback){

	let currentDate = new Date();
	let fullYear = currentDate.getFullYear();

	//send user email
	let name = "Page Insight";
	let from = "webpageinsight@gmail.com";
	let to = email;
	let subject = `Your Page Insight Password Reset Code is ${code}`;
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

				<br/></br>Your Page Insight password reset code is <b>${code}</b>.

				<br/><br/>
				You are receiving this email because you are trying to reset your Page Insight password. If this email was sent
				to you by mistake, please ignore it. If you did not request this change, please visit your Page Insight account
				to secure your account.

				<br/><br/>
				Thanks,
				<br/>Support Team, Page Insight

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

module.exports = router;