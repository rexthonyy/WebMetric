import * as utils from './rex.js';

window.onload = () => {
	getVerifyBtn().onclick = buttonClick;
	getCodeInput().addEventListener("keyup", (event) => {
		event.preventDefault();
		if(event.keyCode === 13){
			buttonClick();
		}
	});
	getResendCode().onclick = () => {
		resendCode();
	};
}

function resendCode(){

	let data = { email: sessionStorage.getItem("email") };
	let url = utils.getHostUrl() + "signup/resendCode";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		hideLoading();
		getCodeInput().focus();

		if(json.status != "success"){
			showError(json.error, 5000);	
		}
	}).catch(err => {
		console.error(err);
		hideLoading();
	});
}

function buttonClick(){
	let code = getCodeInput().value;

	if(!code){
		showError("Please enter the verification code");
		getCodeInput().focus();
		return;
	}
	if(isNaN(code)){
		showError("Please enter a numeric code");
		getCodeInput().focus();
		return;
	}
	if(code.length != 6){
		showError("Code is 6 digits");
		getCodeInput().focus();
		return;
	}

	verifyCode(code);
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
    errorMessage.style.display = "block";
    utils.wait(duration, () => {
        errorMessage.style.display = "none";
    });
}

function verifyCode(code){
	let name = sessionStorage.getItem("name");
	let email = sessionStorage.getItem("email");
	let password = sessionStorage.getItem("password");

	let data = { code: code, name: name, email: email, password: password };
	let url = utils.getHostUrl() + "signup/register";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("userId", json.id);
			sessionStorage.removeItem("name");
			sessionStorage.removeItem("email");
			sessionStorage.removeItem("password");
			window.open("dashboard.html", "_self");
		}else{
			hideLoading();
			showError(json.error, 5000);
			getCodeInput().focus();
		}
	}).catch(err => {
		console.error(err);
		hideLoading();
	});
}

function showLoading(){
	getMainContainer().style.display = "none";
	getProgressContainer().style.display = "block";
}

function hideLoading(){
	getMainContainer().style.display = "block";
	getProgressContainer().style.display = "none";
}

function getMainContainer(){
	return document.getElementById("mainContainer");
}

function getProgressContainer(){
	return document.getElementById("progressContainer");
}

function getCodeInput(){
	return document.getElementById("codeInput");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getVerifyBtn(){
	return document.getElementById("verifyBtn");
}

function getResendCode(){
	return document.getElementById("resendCode");
}