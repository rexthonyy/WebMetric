import * as utils from './rex.js';

window.onload = () => {
	getResetPasswordBtn().onclick = buttonClick;
	getEmailInput().addEventListener("keyup", (event) => {
		event.preventDefault();
		if(event.keyCode === 13){
			buttonClick();
		}
	});
}

function buttonClick(){
	let email = getEmailInput().value.toLowerCase().trim();

	if(!email){
		showError("Please enter your registered email address");
		getEmailInput().focus();
		return;
	}
	if(!utils.isEmailValid(email)){
		showError("Email format not supported");
		getEmailInput().focus();
		return;
	}

	resetPassword(email);
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
    errorMessage.style.display = "block";
    utils.wait(duration, () => {
        errorMessage.style.display = "none";
    });
}

function resetPassword(email){
	let data = { email: email };
	let url = utils.getHostUrl() + "signin/forgottenPassword";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("email", email);
			window.open("verifyEmailForgottenPassword.html", "_self");
		}else{
			hideLoading();
			showError(json.error, 5000);
			getEmailInput().focus();
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

function getEmailInput(){
	return document.getElementById("emailInput");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getResetPasswordBtn(){
	return document.getElementById("resetPasswordBtn");
}