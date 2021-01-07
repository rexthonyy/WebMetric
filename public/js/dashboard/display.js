class Display {
	constructor(){}

	open(){}
	close(){}
}

class DashboardDisplay extends Display {
	constructor(){
		super();
	}

	open(){
		// Display the progress bar
		DashboardDisplay.ShowProgressContainer();

		//load the user data
		this.loadUserData(response => {
			if(!response.isLoaded){
				const alertDialog = new AlertDialog({
					alert: response.message,
					btnLabel: response.btnLabel,
					onclick: response.onclick
				});
				alertDialog.show();
			}else{
				//Setup the views
				this.displaySwitcher = new DisplaySwitcher();

				this.profileDropdownView = new ProfileDropdownView({
					displaySwitcher: this.displaySwitcher, 
					user: response.user
				});

				//Create the ObjectHandler. It dispatches events when its data changes
				const listeners = [
				this.profileDropdownView.update.bind(this.profileDropdownView)
				];

				const subject = new Subject(listeners);

				//don't forget to unsubscribe users who are no longer visible in onclose
				this.userHandler = new ObjectHandler(response.user, subject);

				//return the view to the projects dashboard after the app icon is selected
				getWebsiteIconLabel().onclick = () => {
					this.displaySwitcher.open(new AllProjectsLevelOneDisplay());
				};
				
				//load the next set of displays
				this.displaySwitcher.open(new AllProjectsLevelOneDisplay());

				DashboardDisplay.HideProgressContainer();
			}
		});
	}

	loadUserData(callback){

		let url = getHostUrl() + "user/getUser?apiKey=" + sessionStorage.getItem("apiKey");

		sendGetRequest(url)
		.then(json => {
			if(json.status == 'success'){
				callback({
					isLoaded: true,
					user: json.user
				});
			}else{
				callback({
					isLoaded: false,
					message: json.error,
					btnLabel: 'OK',
					onclick: dg => {
						dg.hide();
						window.open('signin.html', '_self');
					}
				});
			}
		}).catch(err => {
			console.error(err);
			callback({
				isLoaded: false,
				message: err,
				btnLabel: 'OK',
				onclick: dg => {
					dg.hide();
					window.open('signin.html', '_self');
				}
			});
		});
	}

	static ShowProgressContainer(){
		getMainContainer().style.display = "none";
		getMainProgressContainer().style.display = "block";
	}

	static HideProgressContainer(){
		getMainContainer().style.display = "block";
		getMainProgressContainer().style.display = "none";
	}
}

class LevelOneDisplay extends Display {
	constructor(){
		super();
		//close all other displays
		LevelOneDisplay.CloseAllLevelOneDisplayContainers();
	}

	static OpenLevelOneDisplayContainer(index){
		let displayContainers = getLevelOneDisplayContainers();
		displayContainers[index].style.display = "block";
	}

	static CloseAllLevelOneDisplayContainers(){
		let displayContainers = getLevelOneDisplayContainers();
		for(let i = 0; i < displayContainers.length; i++){
			displayContainers[i].style.display = "none";
		}
	}

	static ShowLevelOneProgressContainer(){
		getLevelOneContainer().style.display = "none";
		getLevelOneProgressContainer().style.display = "block";
	}

	static HideLevelOneProgressContainer(){
		getLevelOneContainer().style.display = "block";
		getLevelOneProgressContainer().style.display = "none";
	}
}

class AllProjectsLevelOneDisplay extends LevelOneDisplay {
	constructor(){
		super();
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		new SimpleLevelOneNavContainerView("All Projects", "left");


		//set up the display for the views
		this.childDisplay = new AllProjectsLevelTwoDisplay();
		this.childDisplay.open();
	}

	close(){
		this.childDisplay.close();
	}
}

class CreateProjectLevelOneDisplay extends LevelOneDisplay {
	constructor(){
		super();
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		new SimpleLevelOneNavContainerView("Create New Project", "center");

		//set up the display for the views
		this.childDisplay = new CreateProjectLevelTwoDisplay();
		this.childDisplay.open();
	}

	close(){
		this.childDisplay.close();
	}
}

class SettingsLevelOneDisplay extends LevelOneDisplay {
	constructor(){
		super();
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		new SimpleLevelOneNavContainerView("Manage account", "left");

		//set up the display for the views
		this.childDisplay = new SettingsLevelTwoDisplay();
		this.childDisplay.open();
	}

	close(){
		this.childDisplay.close();
	}
}

class LevelTwoDisplay extends Display {
	constructor(){
		super();
		//close all other displays
		LevelTwoDisplay.CloseAllLevelTwoDisplayContainers();
	}

	static OpenLevelTwoDisplayContainer(index){
		let displayContainers = getLevelTwoDisplayContainers();
		displayContainers[index].style.display = "block";
	}

	static CloseAllLevelTwoDisplayContainers(){
		let displayContainers = getLevelTwoDisplayContainers();
		for(let i = 0; i < displayContainers.length; i++){
			displayContainers[i].style.display = "none";
		}
	}

	static ShowLevelTwoProgressContainer(){
		getLevelTwoContainer().style.display = "none";
		getLevelTwoProgressContainer().style.display = "block";
	}

	static HideLevelTwoProgressContainer(){
		getLevelTwoContainer().style.display = "block";
		getLevelTwoProgressContainer().style.display = "none";
	}
}

class AllProjectsLevelTwoDisplay extends LevelTwoDisplay {
	constructor(){
		super();
	}

	open(){
		LevelTwoDisplay.ShowLevelTwoProgressContainer();
		//load the project detail list
		this.loadProjects(response => {
			if(!response.isLoaded){
				const alertDialog = new AlertDialog({
					alert: response.message,
					btnLabel: response.btnLabel,
					onclick: response.onclick
				});
				alertDialog.show();
			}else{
				this.projects = response.projects;

				getAddProjectBtn().onclick = () => {
					dashboardDisplay.displaySwitcher.open(new CreateProjectLevelOneDisplay());
				};

				getFilterProjectsInput().addEventListener("input", this.filterProjectsInputListener.bind(this));
				this.filterProjects("");

				if(this.projects.length == 0){
					this.showNoProjectContainer();
				}else{
					this.showProjectContainer();
				}

				LevelTwoDisplay.OpenLevelTwoDisplayContainer(0);
				LevelTwoDisplay.HideLevelTwoProgressContainer();
			}
		});
	}

	loadProjects(callback){

		let url = getHostUrl() + "project/getUserProjects?apiKey=" + sessionStorage.getItem("apiKey");

		sendGetRequest(url)
		.then(json => {
			if(json.status == 'success'){
				callback({
					isLoaded: true,
					projects: json.projects
				});
			}else{
				callback({
					isLoaded: false,
					message: json.error,
					btnLabel: 'Retry',
					onclick: dg => {
						dg.hide();
						dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
					}
				});
			}
		}).catch(err => {
			console.error(err);
			callback({
				isLoaded: false,
				message: err,
				btnLabel: 'Retry',
				onclick: dg => {
					dg.hide();
					dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
				}
			});
		});
	}

	filterProjectsInputListener(e){
		this.filterProjects(e.target.value);
	}

	filterProjects(name){
		let html = "";
		this.projects.forEach(project => {
			if(project.name.toLowerCase().trim().includes(name.toLowerCase().trim())){
				html += `
				<div id="${project._id}" class="rex-border-bottom-lightgray rex-selectable-item-background rex-hover">
				<div class="custom-responsive-container rex-height-50px">
				<p class="rex-center-relative-div-vertical custom-responsive-paragraph rex-color-black rex-fs-normal">
				${project.name}
				</p>
				</div>
				</div>
				`;
			}
		});
		getProjectListContainer().innerHTML = html;

		this.projects.forEach(project => {
			document.getElementById(project._id).onclick = () => {
				console.log("Open " + project.name);
			};
		});
	}

	showProjectContainer(){
		getProjectListContainer().style.display = "block";
		getNoProjectContainer().style.display = "none";
	}

	showNoProjectContainer(){
		getProjectListContainer().style.display = "none";
		getNoProjectContainer().style.display = "block";
	}

	close(){
		getFilterProjectsInput().removeEventListener("input", this.filterProjectsInputListener);
	}
}

class CreateProjectLevelTwoDisplay extends LevelTwoDisplay {
	constructor(){
		super();
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(1);

		getCreateProjectBtn().onclick = () => {
			let name = getProjectNameInput().value;
			if(!name){
				showError(getCreateProjectErrorMessage(), "Enter the name of your project");
				getProjectNameInput().focus();
				return;
			}

			this.createProject(name);
		};
	}

	close(){
		getProjectNameInput().value = "";
	}

	createProject(name){

		let data = { name: name, apiKey: sessionStorage.getItem("apiKey") };
		let url = getHostUrl() + "project/createProject";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
			}else{
				showError(getCreateProjectErrorMessage(), json.error, 5000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getCreateProjectErrorMessage(), err, 5000);
		});
	}
}

class SettingsLevelTwoDisplay extends LevelTwoDisplay {
	constructor(){
		super();
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();

		this.hookToUserUpdateListener();
		this.setupProfile();
		this.setupPassword();
		this.setupAPIKey();
		this.setupCloseAccount();

		LevelTwoDisplay.OpenLevelTwoDisplayContainer(2);
	}

	hookToUserUpdateListener(){
		dashboardDisplay.userHandler.subject.listeners.push(this.userUpdated);
	}

	unhookFromUserUpdateListener(){
		// remove entry which was added from array.
		dashboardDisplay.userHandler.subject.listeners = dashboardDisplay.userHandler.subject.listeners.filter(listener => listener !== this.userUpdated);
	}

	userUpdated(user){
		// here you update all the fields with the new user data
		getSettingsEmailInput().value = user.email;
		getSettingsNameInput().value = user.username;

		getHiddenSettingsAPIKeyInput().value = user.apiKey;
		getVisibleSettingsAPIKeyInput().value = user.apiKey;
	}

	setupProfile(){
		//load the data
		let user = dashboardDisplay.userHandler.data;

		getSettingsEmailInput().value = user.email;
		getSettingsNameInput().value = user.username;

		//setup listeners
		getSettingsUpateProfileBtn().onclick = () => {

			let email = getSettingsEmailInput().value.toLowerCase().trim();
			let name = getSettingsNameInput().value.trim();

			if(!email){
				showError(getSettingsUpdateProfileErrorMessage(), "Please enter your email");
				getSettingsEmailInput().focus();
				return;
			}
			if(!isEmailValid(email)){
				showError(getSettingsUpdateProfileErrorMessage(), "Email format not supported");
				getSettingsEmailInput().focus();
				return;
			}
			if(!name){
				showError(getSettingsUpdateProfileErrorMessage(), "Please enter your name");
				getSettingsNameInput().focus();
				return;
			}
			if(email == user.email && name == user.username){
				showError(getSettingsUpdateProfileErrorMessage(), "Profile is already up-to-date");
				return;
			}
			
			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.checkUpdateProfile(email, name);
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	checkUpdateProfile(email, name){

		let user = dashboardDisplay.userHandler.data;

		if(user.email == email){
			this.updateProfile(email, name);
		}else{
			let data = { email: email };
			let url = getHostUrl() + "user/sendEmailVerification";

			LevelTwoDisplay.ShowLevelTwoProgressContainer();

			sendPostRequest(url, data)
			.then(json => {
				LevelTwoDisplay.HideLevelTwoProgressContainer();
				if(json.status == "success"){
					//todo: display the inputDialog and send profile or cancel the operation
					const inputDialog = new InputDialog({
						message: `A verification code was sent to <b>${email}</b>. Please enter the code below`,
						input: "",
						placeholder: "Enter 6 digit verification code",
						btnLabel1: "Confirm",
						btnLabel2: "Cancel",
						onclickBtn1: (dg) => {
							let code = dg.getInput();

							if(!code){
								dg.showError("Please enter the verification code");
								getInputModalInput().focus();
								return;
							}
							if(isNaN(code)){
								dg.showError("Please enter a numeric code");
								getInputModalInput().focus();
								return;
							}
							if(code.length != 6){
								dg.showError("Code is 6 digits");
								getInputModalInput().focus();
								return;
							}
							
							dg.hide();

							this.verifyChangeEmailCode(email, code, name);
						},
						onclickBtn2: (dg) => {
							dg.hide();
						}
					});
					inputDialog.show();
				}else{
					LevelTwoDisplay.HideLevelTwoProgressContainer();
					showError(getSettingsUpdateProfileErrorMessage(), json.error, 8000);
					getSettingsEmailInput().focus();
				}
			}).catch(err => {
				console.error(err);
				LevelTwoDisplay.HideLevelTwoProgressContainer();
				showError(getSettingsUpdateProfileErrorMessage(), err, 8000);
			});
		}
	}

	verifyChangeEmailCode(email, code, name){

		let data = { code: code, email: email };
		let url = getHostUrl() + "user/verifyEmail";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			if(json.status == "success"){
				this.updateProfile(email, name);
			}else{
				DashboardDisplay.HideProgressContainer();
				const alertDialog = new AlertDialog({
					alert: json.error,
					btnLabel: "OK",
					onclick: (dg) => {
						dg.hide();
					}
				});
				alertDialog.show();
			}
		}).catch(err => {
			console.error(err);
			DashboardDisplay.HideProgressContainer();
			const alertDialog = new AlertDialog({
				alert: err,
				btnLabel: "OK",
				onclick: (dg) => {
					dg.hide();
				}
			});
			alertDialog.show();
		});
	}

	updateProfile(email, name){
		let data = { email: email, name: name, apiKey: sessionStorage.getItem("apiKey") };
		let url = getHostUrl() + "user/updateProfile";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Profile updated successfully",
					btnLabel: "OK",
					onclick: (dg) => {
						dashboardDisplay.userHandler.update(json.user);
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				showError(getSettingsUpdateProfileErrorMessage(), json.error, 8000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getSettingsUpdateProfileErrorMessage(), err, 8000);
		});
	}

	setupPassword(){

		let user = dashboardDisplay.userHandler.data;

		getSettingsChangePasswordBtn().onclick = () => {

			let currentPassword = getSettingsCurrentPasswordInput().value;
			let newPassword = getSettingsNewPasswordInput().value;
			let confirmNewPassword = getSettingsConfirmNewPasswordInput().value;

			if(!currentPassword){
				showError(getSettingsChangePasswordErrorMessage(), "Please enter your new password");
				getSettingsCurrentPasswordInput().focus();
				return;
			}
			if(currentPassword.length < 4){
				showError(getSettingsChangePasswordErrorMessage(), "Password must be greater than 3 characters");
				getSettingsCurrentPasswordInput().focus();
				return;
			}

			if(!newPassword){
				showError(getSettingsChangePasswordErrorMessage(), "Please enter your new password");
				getSettingsNewPasswordInput().focus();
				return;
			}
			if(!confirmNewPassword){
				showError(getSettingsChangePasswordErrorMessage(), "Please retype your new password");
				getSettingsConfirmNewPasswordInput().focus();
				return;
			}
			if(newPassword.length < 4){
				showError(getSettingsChangePasswordErrorMessage(), "Password must be greater than 3 characters");
				getSettingsNewPasswordInput().focus();
				return;
			}
			if(newPassword != confirmNewPassword){
				showError(getSettingsChangePasswordErrorMessage(), "Passwords do not match");
				getSettingsConfirmNewPasswordInput().focus();
				return;
			}
			if(currentPassword == newPassword){
				showError(getSettingsChangePasswordErrorMessage(), "You are already using this password for this account");
				return;
			}
			if(user.password != currentPassword){
				showError(getSettingsChangePasswordErrorMessage(), "Incorrect password");
				getSettingsCurrentPasswordInput().focus();
				return;
			}
			//if(user.password == currentPassword)

			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.updatePassword(user.email, newPassword);
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	updatePassword(email, password){
		
		let data = { email: email, password: password };
		let url = getHostUrl() + "user/changePassword";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				dashboardDisplay.userHandler.update(json.user);
				getSettingsCurrentPasswordInput().value = "";
				getSettingsNewPasswordInput().value = "";
				getSettingsConfirmNewPasswordInput().value = "";
				//alert
				const alertDialog = new AlertDialog({
					alert: "Password changed successfully",
					btnLabel: "OK",
					onclick: dg => {
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				showError(getSettingsChangePasswordErrorMessage(), json.error, 10000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getSettingsChangePasswordErrorMessage(), err, 10000);
		});
	}

	setupAPIKey(){

		let user = dashboardDisplay.userHandler.data;

		getHiddenSettingsAPIKeyInput().value = user.apiKey;
		getVisibleSettingsAPIKeyInput().value = user.apiKey;

		this.isAPIKeyVisible = true;
		this.toggleAPIKeyInputVisibility();

		getSettingsShowHideAPIKeyBtn().onclick = () => {
			this.toggleAPIKeyInputVisibility();
		};

		getSettingsRegenerateAPIKeyBtn().onclick = () => {
			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.regenerateAPIKey();
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	toggleAPIKeyInputVisibility(){
		if(this.isAPIKeyVisible){
			this.isAPIKeyVisible = false;
			getSettingsShowHideAPIKeyBtn().textContent = "Show";
			getHiddenSettingsAPIKeyInput().style.display = "block";
			getVisibleSettingsAPIKeyInput().style.display = "none";
		}else{
			this.isAPIKeyVisible = true;
			getSettingsShowHideAPIKeyBtn().textContent = "Hide";
			getHiddenSettingsAPIKeyInput().style.display = "none";
			getVisibleSettingsAPIKeyInput().style.display = "block";
		}
	}

	regenerateAPIKey(){

		let data = { apiKey: sessionStorage.getItem("apiKey") };
		let url = getHostUrl() + "user/regenerateAPIKey";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Your API Key was updated successfully",
					btnLabel: "OK",
					onclick: (dg) => {
						sessionStorage.setItem("apiKey", json.user.apiKey);
						dashboardDisplay.userHandler.update(json.user);
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				showError(getSettingsAPIKeyErrorMessage(), json.error, 8000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getSettingsAPIKeyErrorMessage(), err, 8000);
		});
	}

	setupCloseAccount(){
		getSettingsCloseAccountBtn().onclick = () => {
			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.closeAccount();
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	closeAccount(){
		let user = dashboardDisplay.userHandler.data;

		let data = { email: user.email, password: user.password, apiKey: sessionStorage.getItem("apiKey") };
		let url = getHostUrl() + "user/closeAccount";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "It was nice having you. Have a good day.",
					btnLabel: "OK",
					onclick: (dg) => {
						sessionStorage.removeItem("apiKey");
						window.open("index.html", "_self");
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				DashboardDisplay.HideProgressContainer();
				const alertDialog = new AlertDialog({
					alert: json.error,
					btnLabel: "OK",
					onclick: (dg) => {
						dg.hide();
					}
				});
				alertDialog.show();
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			const alertDialog = new AlertDialog({
				alert: err,
				btnLabel: "OK",
				onclick: (dg) => {
					dg.hide();
				}
			});
			alertDialog.show();
		});
	}

	close(){
		this.unhookFromUserUpdateListener();
		getSettingsCurrentPasswordInput().value = "";
		getSettingsNewPasswordInput().value = "";
		getSettingsConfirmNewPasswordInput().value = "";
	}
}