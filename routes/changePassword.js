const express = require('express');
const router = express.Router();
const User = require('../models/users');
const util = require('../libs/util');

router.post('/', (req, res) => {
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

            try{
                const user = await doc.save();

                sendEmailTo(email, user, isSent => {});

                res.json({ status: 'success', user: user });
            }catch(err){
                res.status(400).json({ status: 'failed', error: 'Failed to change password'});
            }
        }
    });
});

function sendEmailTo(email, user, callback){

	let currentDate = new Date();
	let fullYear = currentDate.getFullYear();

	//send user email
	let name = "WebMetric";
	let from = "gringvoip@gmail.com";
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
				If you did not request this change, please visit your WebMetric account
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

module.exports = router;