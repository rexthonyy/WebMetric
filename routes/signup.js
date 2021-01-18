const express = require('express');
const router = express.Router();
const User = require('../models/users');
const { v4: uuidV4 } = require('uuid');
const EmailVerification = require('../models/emailVerification');
const util = require('../libs/util');

router.post('/', checkExpiredCode, (req, res) => {
	sendVerifyCode(req, res);
});

router.post('/resendCode', checkExpiredCode, (req, res) => {
	sendVerifyCode(req, res);
	
});

function sendVerifyCode(req, res){
	let email = req.body.email;

	User.findOne({ email: email }, (err, doc) => {
        if(err) {
            res.json({ status: 'failed', error: err });
        } 
        if(doc != null){
            res.json({ status: 'failed', error: 'Email is already signed up'});
        }else{
        	//send email
            EmailVerification.find({ email: email, type: 'signup' }, async (err, doc) => {
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
							type: 'signup',
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
            res.json({ status: 'failed', error: err});
        }
        if(doc != null){
            //delete expired emails
            doc.forEach(element => {
                let expire = element.expire;
                let now = Date.now();
                let expirationTime = 1000 * 60 * 30;//30 minutes

                if(now > (expire + expirationTime)){
                    console.log("Removed expired email verification item");
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
	let subject = `Your Page Insight Verification code is ${code}`;
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

				<br/></br>Your Page Insight verification code is <b>${code}</b>.

				<br/><br/>
				You are receiving this email because you are trying to sign up for Page Insight. If this email was sent
				to you by mistake, please ignore it.

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

router.post('/register', checkExpiredCode, (req, res) => {
	let code = req.body.code;
	let name = req.body.name;
	let email = req.body.email;
	let password = req.body.password;

	EmailVerification.findOne({ type: 'signup', email: email, code: code}, (err, doc) => {
        if(err){
            res.json({ status: 'failed', error: err });
        }
        if(doc == null){
            res.json({ status: 'failed', error: 'Invalid code' });
        }else{
            doc.remove();
            
            User.findOne({ email: email }, async (err, doc) => {
		        if(err) {
		            res.json({ status: 'failed', error: err });
		        } 
		        if(doc != null){
		            res.json({ status: 'failed', error: 'Email is already signed up'});
		        }else{
		        	const user = new User({
		                apiKey: uuidV4(),
		                username: name,
		                email: email,
		                password: password
		            });

		            try{
		                const newUser = await user.save();
		                res.status(201).json({ status: 'success', apiKey: newUser.apiKey });
		            }catch(err){
		                res.status(400).json({ status: 'failed', error: err });
		            }
		        }
		    });
	    }
    });
});
module.exports = router;