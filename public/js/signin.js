import * as utils from './rex.js';

window.onload = () => {
	getLoginBtn().onclick = () => {
		let email = getEmailInput().value.toLowerCase().trim();
		let password = getPasswordInput().value.trim();

		if(!email){
			utils.showError(getErrorMessage(), "Please enter your email");
			getEmailInput().focus();
			return;
		}
		if(!password){
			utils.showError(getErrorMessage(), "Please enter your password");
			getPasswordInput().focus();
			return;
		}
		if(!utils.isEmailValid(email)){
			utils.showError(getErrorMessage(), "Email format not supported");
			getEmailInput().focus();
			return;
		}
		if(password.length < 4){
			utils.showError(getErrorMessage(), "Password must be greater than 3 characters");
			getPasswordInput().focus();
			return;
		}

		login(email, password);
	};
}

function openDashboard(){
	window.open("dashboard.html", "_self");
}

function login(email, password){
	let data = { email: email, password: password };
	let url = utils.getHostUrl() + "signin";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("apiKey", json.apiKey);
			openDashboard();
		}else{
			hideLoading();
			utils.showError(getErrorMessage(), json.error, 5000);
		}
	}).catch(err => {
		hideLoading();
		console.error(err);
		utils.showError(getErrorMessage(), err, 5000);
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

function getPasswordInput(){
	return document.getElementById("passwordInput");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getLoginBtn(){
	return document.getElementById("loginBtn");
}