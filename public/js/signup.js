import * as utils from './rex.js';

window.onload = () => {
	getSignupBtn().onclick = () => {
		let name = getNameInput().value.trim();
		let email = getEmailInput().value.toLowerCase().trim();
		let password1 = getPassword1Input().value.trim();
		let password2 = getPassword2Input().value.trim();

		if(!name){
			utils.showError(getErrorMessage(), "Please enter your name");
			getNameInput().focus();
			return;
		}
		if(!email){
			utils.showError(getErrorMessage(), "Please enter your email");
			getEmailInput().focus();
			return;
		}
		if(!password1){
			utils.showError(getErrorMessage(), "Please enter your password");
			getPassword1Input().focus();
			return;
		}
		if(!password2){
			utils.showError(getErrorMessage(), "Please retype your password");
			getPassword2Input().focus();
			return;
		}
		if(!utils.isEmailValid(email)){
			utils.showError(getErrorMessage(), "Email format not supported");
			getEmailInput().focus();
			return;
		}
		if(password1.length < 4){
			utils.showError(getErrorMessage(), "Password must be greater than 3 characters");
			getPassword1Input().focus();
			return;
		}
		if(password1 != password2){
			utils.showError(getErrorMessage(), "Passwords do not match");
			getPassword2Input().focus();
			return;
		}

		signup(name, email, password1);
	};
}

function signup(name, email, password){
	let data = { email: email };
	let url = utils.getHostUrl() + "signup";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		if(json.status == "success"){
			sessionStorage.setItem("name", name);
			sessionStorage.setItem("email", email);
			sessionStorage.setItem("password", password);
			window.open("verifyEmailSignup.html", "_self");
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

function getNameInput(){
	return document.getElementById("nameInput");
}

function getEmailInput(){
	return document.getElementById("emailInput");
}

function getPassword1Input(){
	return document.getElementById("password1Input");
}

function getPassword2Input(){
	return document.getElementById("password2Input");
}

function getErrorMessage(){
	return document.getElementById("errorMessage");
}

function getSignupBtn(){
	return document.getElementById("signupBtn");
}

