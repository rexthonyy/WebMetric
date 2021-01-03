import * as utils from './rex.js';

window.onload = () => {
	setInputListeners();
	setClickListeners();
}

function setInputListeners(){
	getPassword1Input().addEventListener("keyup", (event) => {
		event.preventDefault();
		if(event.keyCode === 13){
			resetPasswordBtnClick();
		}
	});
	getPassword2Input().addEventListener("keyup", (event) => {
		event.preventDefault();
		if(event.keyCode === 13){
			resetPasswordBtnClick();
		}
	});
}

function setClickListeners(){
	getChangePasswordBtn().onclick = resetPasswordBtnClick;
	getPasswordChangedModalBtn().onclick = leaveThisPage;
}

function leaveThisPage(){
	window.open("signin.html", "_self");
}

function resetPasswordBtnClick(){
	let password1 = getPassword1Input().value.trim();
	let password2 = getPassword2Input().value.trim();

	if(!password1){
		showError("Please enter your password");
		getPassword1Input().focus();
		return;
	}
	if(!password2){
		showError("Please retype your password");
		getPassword2Input().focus();
		return;
	}
	if(password1.length < 4){
		showError("Password must be greater than 3 characters");
		getPassword1Input().focus();
		return;
	}
	if(password1 != password2){
		showError("Passwords do not match");
		getPassword1Input().focus();
		return;
	}

	changePassword(password1);
}

function changePassword(password){
	const email = sessionStorage.getItem("email");

	let data = { email: email, password: password };
	let url = utils.getHostUrl() + "changePassword";

	showLoading();

	utils.sendPostRequest(url, data)
	.then(json => {
		hideLoading();
		if(json.status == "success"){
			sessionStorage.removeItem("email", email);
			showModal();
		}else{
			showError(json.error, 5000);
		}
	}).catch(err => {
		hideLoading();
		console.error(err);
		showError(err, 5000);
	});
}

function showError(error, duration = 3000){
	let errorMessage = getErrorMessage();
	errorMessage.textContent = error;
    errorMessage.style.display = "block";
    utils.wait(duration, () => {
        errorMessage.style.display = "none";
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

function showModal(){
	getModalBackground().style.display = "flex";
}

function hideModal(){
	getModalBackground().style.display = "none";
}

function getMainContainer(){
	return document.getElementById("mainContainer");
}

function getProgressContainer(){
	return document.getElementById("progressContainer");
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

function getChangePasswordBtn(){
	return document.getElementById("changePasswordBtn");
}

function getModalBackground(){
	return document.getElementById("modalBackground");
}

function getPasswordChangedModal(){
	return document.getElementById("passwordChangedModal");
}

function getPasswordChangedModalBtn(){
	return document.getElementById("passwordChangedModalBtn");
}