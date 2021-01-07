const fetch = require('node-fetch');
const url = require('url');

function wait(time, func){
	setTimeout(() => {
		func();
	}, time);
}

function isEmailValid(email){
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

async function sendGetRequest(url){
    let response = await fetch(url);
    let json = await response.json();

	return json;
}

async function sendPostRequest(url, data){
	let response = await fetch(url, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	
	let json = await response.json();

	return json;
}

function getRandom(min, max){
	return myMap(Math.random(), 0, 1, min, max);
}

function myMap(val, minF, maxF, minT, maxT){
	return minT + (((val - minF)/(maxF - minF)) * (maxT - minT));
}

function getFullUrl(req){
	return url.format({
		protocol: req.protocol,
		host: req.get('host'),
		pathname: req.originalUrl
	});
}

function getHostUrl(req){
	return url.format({
		protocol: req.protocol,
		host: req.get('host')
	});
}

function getSendEmailUrl(){
	return "http://rexthonyy.000webhostapp.com/apps/personal/EmailSender/sendEmailJSRequest.php";
}

module.exports = {
	wait,
	isEmailValid,
	sendGetRequest,
	sendPostRequest,
	getRandom,
	myMap,
	getFullUrl,
	getHostUrl,
	getSendEmailUrl
};