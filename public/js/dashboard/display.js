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

				//a dropdown handler to dispatch changes to the all projects views or watchers
				this.projectHandler = new ObjectHandler(undefined, new Subject([]));

				//a dropdown handler to dispatch changes to the all page or watchers
				this.pageHandler = new ObjectHandler(undefined, new Subject([]));

				//a dropdown handler to dispatch changes to the all events or watchers
				this.eventHandler = new ObjectHandler(undefined, new Subject([]));

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

	getNavigationHTML(navArray){
		let html = "";
		for(let i = 0; i < navArray.length; i++){
			if(i > 0){
				html += " <span class='rex-mr-8px'> > </span>";
			}

			html += 
			`
			<span id='navChip_${i}' class='rex-underline-onhover rex-hover rex-mr-8px'>${navArray[i]}</span>
			`;
		}
		return html;
	}

	setNavigationClickListeners(navArray){
		for(let i = 0; i < navArray.length; i++){
			document.getElementById(`navChip_${i}`).onclick = () => {
				this.onclickNavItem(i);
			};
		}
	}

	onclickNavItem(index){}
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

class AllPagesLevelOneDisplay extends LevelOneDisplay {
	constructor(project){
		super();
		this.project = project;
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		let navArray = ['All Projects', this.project.name];
		this.navContainerView = new SimpleLevelOneNavContainerView(this.getNavigationHTML(navArray), "left");

		this.setNavigationClickListeners(navArray);

		//listener for changes to the project name
		this.hookToProjectUpdateListener();

		//set up the display for the view
		this.childDisplay = new AllPagesLevelTwoDisplay(this.project);
		this.childDisplay.open();
	}

	onclickNavItem(index){
		switch(index){
			case 0:
			dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
			break;

			case 1:
			dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
			break;
		}
	}

	hookToProjectUpdateListener(){
		dashboardDisplay.projectHandler.subject.listeners.push(this.projectUpdated.bind(this));
		//console.log(dashboardDisplay.projectHandler.subject.listeners.length);
	}

	unhookFromProjectUpdateListener(){
		//test to ensure that this is removed
		dashboardDisplay.projectHandler.subject.listeners.pop();
	}

	projectUpdated(project){
		this.project = project;
		let navArray = ['All Projects', project.name];
		this.navContainerView.update(this.getNavigationHTML(navArray), "left");
		this.setNavigationClickListeners(navArray);
	}

	close(){
		this.unhookFromProjectUpdateListener();
		this.childDisplay.close();
	}
}

class CreatePageLevelOneDisplay extends LevelOneDisplay {
	constructor(project){
		super();
		this.project = project;
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		new SimpleLevelOneNavContainerView("Create New Page", "center");

		//set up the display for the views
		this.childDisplay = new CreatePageLevelTwoDisplay(this.project);
		this.childDisplay.open();
	}

	close(){
		this.childDisplay.close();
	}
}

class AllEventsLevelOneDisplay extends LevelOneDisplay {
	constructor(project, page){
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		let navArray = ['All Projects', this.project.name, this.page.name];
		this.navContainerView = new SimpleLevelOneNavContainerView(this.getNavigationHTML(navArray), "left");

		this.setNavigationClickListeners(navArray);

		//listener for changes to the project name
		this.hookToPageUpdateListener();

		//set up the display for the view
		this.childDisplay = new AllEventsLevelTwoDisplay(this.project, this.page);
		this.childDisplay.open();
	}

	onclickNavItem(index){
		switch(index){
			case 0:
			dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
			break;

			case 1:
			dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
			break;

			case 2:
			dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, this.page));
			break;
		}
	}

	hookToPageUpdateListener(){
		dashboardDisplay.pageHandler.subject.listeners.push(this.pageUpdated.bind(this));
		//console.log(dashboardDisplay.pageHandler.subject.listeners.length);
	}

	unhookFromPageUpdateListener(){
		//test to ensure that this is removed
		dashboardDisplay.pageHandler.subject.listeners.pop();
	}

	pageUpdated(page){
		this.page = page;
		let navArray = ['All Projects', this.project.name, page.name];
		this.navContainerView.update(this.getNavigationHTML(navArray), "left");
		this.setNavigationClickListeners(navArray);
	}

	close(){
		this.unhookFromPageUpdateListener();
		this.childDisplay.close();
	}
}

class CreateEventLevelOneDisplay extends LevelOneDisplay {
	constructor(project, page){
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		new SimpleLevelOneNavContainerView("Create New Event", "center");

		//set up the display for the views
		this.childDisplay = new CreateEventLevelTwoDisplay(this.project, this.page);
		this.childDisplay.open();
	}

	close(){
		this.childDisplay.close();
	}
}

class EventLevelOneDisplay extends LevelOneDisplay {
	constructor(project, page, event){
		super();
		this.project = project;
		this.page = page;
		this.event = event;
	}

	open(){
		LevelOneDisplay.HideLevelOneProgressContainer();
		let navArray = ['All Projects', this.project.name, this.page.name, this.event.name];
		this.navContainerView = new SimpleLevelOneNavContainerView(this.getNavigationHTML(navArray), "left");

		this.setNavigationClickListeners(navArray);

		//listener for changes to the project name
		this.hookToEventUpdateListener();

		//set up the display for the view
		this.childDisplay = new EventLevelTwoDisplay(this.project, this.page, this.event);
		this.childDisplay.open();
	}

	onclickNavItem(index){
		switch(index){
			case 0:
			dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
			break;

			case 1:
			dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
			break;

			case 2:
			dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, this.page));
			break;

			case 3:
			dashboardDisplay.displaySwitcher.open(new EventLevelOneDisplay(this.project, this.page, this.event));
			break;
		}
	}

	hookToEventUpdateListener(){
		dashboardDisplay.eventHandler.subject.listeners.push(this.eventUpdated.bind(this));
		//console.log(dashboardDisplay.pageHandler.subject.listeners.length);
	}

	unhookFromEventUpdateListener(){
		//test to ensure that this is removed
		dashboardDisplay.eventHandler.subject.listeners.pop();
	}

	eventUpdated(event){
		this.event = event;
		let navArray = ['All Projects', this.project.name, this.page.name, event.name];
		this.navContainerView.update(this.getNavigationHTML(navArray), "left");
		this.setNavigationClickListeners(navArray);
	}

	close(){
		this.unhookFromEventUpdateListener();
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

				//dashboardDisplay.allProjectsDropdownHandler.update(this.projects);//get access to all the projects

				getAddProjectBtn().onclick = () => {
					dashboardDisplay.displaySwitcher.open(new CreateProjectLevelOneDisplay());
				};

				getFilterProjectsInput().addEventListener("input", this.filterProjectsInputListener.bind(this));
				this.filterProjects("");

				if(this.projects.length == 0){
					getNoProjectContainer().querySelector('p').textContent = "Create a project to get started";
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
		let filteredProjects = [];
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
				filteredProjects.push(project);
			}
		});
		getProjectListContainer().innerHTML = html;

		if(filteredProjects.length > 0){
			filteredProjects.forEach(project => {
				document.getElementById(project._id).onclick = () => {
					dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(project));
				};
			});
			this.showProjectContainer();
		}else{
			getNoProjectContainer().querySelector('p').textContent = `'${name}' could not be found`;
			this.showNoProjectContainer();
		}
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
			let name = escapeHTML(getProjectNameInput().value.trim());
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

			let user = dashboardDisplay.userHandler.data;

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

		getSettingsChangePasswordBtn().onclick = () => {

			let user = dashboardDisplay.userHandler.data;

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
				message: "<p style='color:red;'>Are you sure?</p>",
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

class AllPagesLevelTwoDisplay extends LevelTwoDisplay {
	constructor(project) {
		super();
		this.project = project;
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(3);

		let navigationList = [
		{
			title: 'All Pages',
			isSelected: true
		},
		{
			title: 'Settings',
			isSelected: false
		}
		];

		this.navContainerView = new NavContainerView(navigationList, index => {
			this.navContainerView.selectNavItem(index);
			this.childDisplay.close();
			this.openLevelThreeDisplay(index);
		});

		this.openLevelThreeDisplay(0);

		//listener for changes to the project name
		this.hookToProjectUpdateListener();
	}

	openLevelThreeDisplay(index){
		switch(index){
			case 0:
			this.childDisplay = new AllPagesLevelThreeDisplay(this.project);
			this.childDisplay.open();
			break;

			case 1:
			this.childDisplay = new ProjectSettingsLevelThreeDisplay(this.project);
			this.childDisplay.open();
			break;

			default:
			console.log("Default nav menu item");
			break;
		}
	}

	hookToProjectUpdateListener(){
		dashboardDisplay.projectHandler.subject.listeners.push(this.projectUpdated.bind(this));
	}

	unhookFromProjectUpdateListener(){
		dashboardDisplay.projectHandler.subject.listeners.pop();
	}

	projectUpdated(project){
		this.project = project;
	}

	close(){
		this.unhookFromProjectUpdateListener();
		this.childDisplay.close();
	}
}

class CreatePageLevelTwoDisplay extends LevelTwoDisplay {
	constructor(project){
		super();
		this.project = project;
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(4);

		getCreatePageBtn().onclick = () => {
			let name = escapeHTML(getPageNameInput().value.trim());
			if(!name){
				showError(getCreatePageErrorMessage(), "Enter the name of your page");
				getPageNameInput().focus();
				return;
			}

			this.createPage(name);
		};
	}

	close(){
		getPageNameInput().value = "";
	}

	createPage(name){

		let data = { name: name, apiKey: sessionStorage.getItem("apiKey"), projectId: this.project._id };
		let url = getHostUrl() + "page/createPage";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
			}else{
				showError(getCreatePageErrorMessage(), json.error, 5000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getCreatePageErrorMessage(), err, 5000);
		});
	}
}

class AllEventsLevelTwoDisplay extends LevelTwoDisplay {
	constructor(project, page){
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(3);

		let navigationList = [
		{
			title: 'All Events',
			isSelected: true
		},
		{
			title: 'Settings',
			isSelected: false
		}
		];

		this.navContainerView = new NavContainerView(navigationList, index => {
			this.navContainerView.selectNavItem(index);
			this.childDisplay.close();
			this.openLevelThreeDisplay(index);
		});

		this.openLevelThreeDisplay(0);

		//listener for changes to the page details
		this.hookToPageUpdateListener();
	}

	openLevelThreeDisplay(index){
		switch(index){
			case 0:
			this.childDisplay = new AllEventsLevelThreeDisplay(this.project, this.page);
			this.childDisplay.open();
			break;

			case 1:
			this.childDisplay = new PageSettingsLevelThreeDisplay(this.project, this.page);
			this.childDisplay.open();
			break;

			default:
			console.log("Default events nav menu item");
			break;
		}
	}

	hookToPageUpdateListener(){
		dashboardDisplay.pageHandler.subject.listeners.push(this.pageUpdated.bind(this));
		//console.log(dashboardDisplay.pageHandler.subject.listeners.length);
	}

	unhookFromPageUpdateListener(){
		//test to ensure that this is removed
		dashboardDisplay.pageHandler.subject.listeners.pop();
	}

	pageUpdated(page){
		this.page = page;
	}

	close(){
		this.unhookFromPageUpdateListener();
		this.childDisplay.close();
	}
}

class CreateEventLevelTwoDisplay extends LevelTwoDisplay {
	constructor(project, page){
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(5);

		getCreateEventBtn().onclick = () => {
			let name = escapeHTML(getEventNameInput().value.trim());
			let description = escapeHTML(getEventDescriptionInput().value.trim());
			if(!name){
				showError(getCreateEventErrorMessage(), "Enter the name of the event");
				getEventNameInput().focus();
				return;
			}

			this.createEvent(name, description);
		};
	}

	close(){
		getEventNameInput().value = "";
		getEventDescriptionInput().value = "";
	}

	createEvent(name, description){

		let data = { name: name, description: description, apiKey: sessionStorage.getItem("apiKey"), projectId: this.page.projectId, pageId: this.page._id };
		let url = getHostUrl() + "event/createEvent";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, this.page));
			}else{
				showError(getCreateEventErrorMessage(), json.error, 5000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getCreateEventErrorMessage(), err, 5000);
		});
	}
}

class EventLevelTwoDisplay extends LevelTwoDisplay {
	constructor(project, page, event){
		super();
		this.project = project;
		this.page = page;
		this.event = event;
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(3);

		let navigationList = [
		{
			title: 'Overview',
			isSelected: true
		},
		{
			title: 'Settings',
			isSelected: false
		}
		];

		this.navContainerView = new NavContainerView(navigationList, index => {
			this.navContainerView.selectNavItem(index);
			this.childDisplay.close();
			this.openLevelThreeDisplay(index);
		});

		this.openLevelThreeDisplay(0);

		//listener for changes to the page details
		this.hookToEventUpdateListener();
	}

	openLevelThreeDisplay(index){
		switch(index){
			case 0:
			this.childDisplay = new EventLevelThreeDisplay(this.project, this.page, this.event);
			this.childDisplay.open();
			break;

			case 1:
			this.childDisplay = new EventSettingsLevelThreeDisplay(this.project, this.page, this.event);
			this.childDisplay.open();
			break;

			default:
			console.log("Default events nav menu item selection");
			break;
		}
	}

	hookToEventUpdateListener(){
		dashboardDisplay.eventHandler.subject.listeners.push(this.eventUpdated.bind(this));
		//console.log(dashboardDisplay.pageHandler.subject.listeners.length);
	}

	unhookFromEventUpdateListener(){
		//test to ensure that this is removed
		dashboardDisplay.eventHandler.subject.listeners.pop();
	}

	eventUpdated(event){
		this.event = event;
	}

	close(){
		this.unhookFromEventUpdateListener();
		this.childDisplay.close();
	}
}

class LevelThreeDisplay extends Display {
	constructor(){
		super();
		//close all other displays
		LevelThreeDisplay.CloseAllLevelThreeDisplayContainers();
	}

	static OpenLevelThreeDisplayContainer(index){
		let displayContainers = getLevelThreeDisplayContainers();
		displayContainers[index].style.display = "block";
	}

	static CloseAllLevelThreeDisplayContainers(){
		let displayContainers = getLevelThreeDisplayContainers();
		for(let i = 0; i < displayContainers.length; i++){
			displayContainers[i].style.display = "none";
		}
	}

	static ShowLevelThreeProgressContainer(){
		getLevelThreeContainer().style.display = "none";
		getLevelThreeProgressContainer().style.display = "block";
	}

	static HideLevelThreeProgressContainer(){
		getLevelThreeContainer().style.display = "block";
		getLevelThreeProgressContainer().style.display = "none";
	}
}

class AllPagesLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project) {
		super();
		this.project = project;
	}

	open(){
		LevelThreeDisplay.ShowLevelThreeProgressContainer();
		
		this.loadPages(response => {
			if(!response.isLoaded){
				const alertDialog = new AlertDialog({
					alert: response.message,
					btnLabel: response.btnLabel,
					onclick: response.onclick
				});
				alertDialog.show();
			}else{
				this.pages = response.pages;

				getAddPageBtn().onclick = () => {
					dashboardDisplay.displaySwitcher.open(new CreatePageLevelOneDisplay(this.project));
				};

				getFilterPagesInput().addEventListener("input", this.filterPagesInputListener.bind(this));
				this.filterPages("");

				if(this.pages.length == 0){
					getNoPageContainer().querySelector('p').textContent = "Create a page to get started";
					this.showNoPageContainer();
				}else{
					this.showPageContainer();
				}

				LevelThreeDisplay.OpenLevelThreeDisplayContainer(0);
				LevelThreeDisplay.HideLevelThreeProgressContainer();
			}
		});
	}

	loadPages(callback){

		let url = getHostUrl() + "page/getProjectPages?apiKey=" + sessionStorage.getItem("apiKey") + "&projectId=" + this.project._id;

		sendGetRequest(url)
		.then(json => {
			if(json.status == 'success'){
				callback({
					isLoaded: true,
					pages: json.pages
				});
			}else{
				callback({
					isLoaded: false,
					message: json.error,
					btnLabel: 'Retry',
					onclick: dg => {
						dg.hide();
						dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
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
					dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
				}
			});
		});
	}

	filterPagesInputListener(e){
		this.filterPages(e.target.value);
	}

	filterPages(name){
		let filteredPages = [];
		let html = "";
		this.pages.forEach(page => {
			if(page.name.toLowerCase().trim().includes(name.toLowerCase().trim())){
				html += `
				<div id="${page._id}" class="rex-border-bottom-lightgray rex-selectable-item-background rex-hover">
				<div class="custom-responsive-container rex-height-50px">
				<p class="rex-center-relative-div-vertical custom-responsive-paragraph rex-color-black rex-fs-normal">
				${page.name}
				</p>
				</div>
				</div>
				`;
				filteredPages.push(page);
			}
		});

		getPageListContainer().innerHTML = html;

		if(filteredPages.length > 0){
			filteredPages.forEach(page => {
				document.getElementById(page._id).onclick = () => {
					dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, page));
				};
			});
			this.showPageContainer();
		}else{
			getNoPageContainer().querySelector('p').textContent = `'${name}' could not be found`;
			this.showNoPageContainer();
		}
	}

	showPageContainer(){
		getPageListContainer().style.display = "block";
		getNoPageContainer().style.display = "none";
	}

	showNoPageContainer(){
		getPageListContainer().style.display = "none";
		getNoPageContainer().style.display = "block";
	}

	close(){
		getFilterPagesInput().removeEventListener("input", this.filterPagesInputListener);
	}
}

class ProjectSettingsLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project) {
		super();
		this.project = project;
	}

	open(){
		LevelThreeDisplay.HideLevelThreeProgressContainer();

		this.hookToProjectUpdateListener();
		this.setupProjectInfo();
		this.setupDeleteProject();

		LevelThreeDisplay.OpenLevelThreeDisplayContainer(1);
	}

	hookToProjectUpdateListener(){
		dashboardDisplay.projectHandler.subject.listeners.push(this.projectUpdated.bind(this));
	}

	unhookFromProjectUpdateListener(){
		// remove entry which was added from array.
		//test to ensure that this is removed
		dashboardDisplay.projectHandler.subject.listeners.pop();
	}

	projectUpdated(project){
		// here you update all the fields with the new project data
		this.project = project;
		getSettingsProjectNameInput().value = project.name;
	}

	setupProjectInfo(){
		getSettingsProjectNameInput().value = this.project.name;

		getSettingsUpateProjectBtn().onclick = () => {

			let projectName = escapeHTML(getSettingsProjectNameInput().value.trim());

			if(!projectName){
				showError(getSettingsUpdateProjectErrorMessage(), "Please enter the project name");
				getSettingsNameInput().focus();
				return;
			}
			if(projectName == this.project.name){
				showError(getSettingsUpdateProjectErrorMessage(), "Project name is already up-to-date");
				return;
			}
			
			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.updateProjectName(projectName);
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	updateProjectName(name){
		let data = { projectName: name, apiKey: sessionStorage.getItem("apiKey"), projectId: this.project._id };
		let url = getHostUrl() + "project/updateProject";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Project updated successfully",
					btnLabel: "OK",
					onclick: (dg) => {
						dashboardDisplay.projectHandler.update(json.project);
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				showError(getSettingsUpdateProjectErrorMessage(), json.error, 8000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getSettingsUpdateProjectErrorMessage(), err, 8000);
		});
	}

	setupDeleteProject(){
		getSettingsDeleteProjectBtn().onclick = () => {
			const choiceDialog = new ChoiceDialog({
				message: "<p style='color:red;'>Delete project. Are you sure?</p>",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.deleteProject();
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	deleteProject(){
		let data = { apiKey: sessionStorage.getItem("apiKey"), projectId: this.project._id };
		let url = getHostUrl() + "project/deleteProject";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Project deleted successfully.",
					btnLabel: "OK",
					onclick: (dg) => {
						DashboardDisplay.HideProgressContainer();
						dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
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
		this.unhookFromProjectUpdateListener();
		getSettingsProjectNameInput().value = "";
	}
}

class AllEventsLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project, page) {
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelThreeDisplay.ShowLevelThreeProgressContainer();

		this.loadEvents(response => {
			if(!response.isLoaded){
				const alertDialog = new AlertDialog({
					alert: response.message,
					btnLabel: response.btnLabel,
					onclick: response.onclick
				});
				alertDialog.show();
			}else{
				this.events = response.events;

				getAddEventBtn().onclick = () => {
					dashboardDisplay.displaySwitcher.open(new CreateEventLevelOneDisplay(this.project, this.page));
				};

				getFilterEventsInput().addEventListener("input", this.filterEventsInputListener.bind(this));
				this.filterEvents("");

				if(this.events.length == 0){
					getNoEventContainer().querySelector('p').textContent = "Create an event to get started";
					this.showNoEventContainer();
				}else{
					this.showEventContainer();
				}

				LevelThreeDisplay.OpenLevelThreeDisplayContainer(2);
				LevelThreeDisplay.HideLevelThreeProgressContainer();
			}
		});
	}

	loadEvents(callback){

		let url = getHostUrl() + "event/getPageEvents?apiKey=" + sessionStorage.getItem("apiKey") + "&projectId=" + this.page.projectId + "&pageId=" + this.page._id;

		sendGetRequest(url)
		.then(json => {
			if(json.status == 'success'){
				callback({
					isLoaded: true,
					events: json.events
				});
			}else{
				callback({
					isLoaded: false,
					message: json.error,
					btnLabel: 'Retry',
					onclick: dg => {
						dg.hide();
						dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, this.page));
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
					dashboardDisplay.displaySwitcher.open(new AllEventsLevelOneDisplay(this.project, this.page));
				}
			});
		});
	}

	filterEventsInputListener(e){
		this.filterEvents(e.target.value);
	}

	filterEvents(name){
		let filteredEvents = [];
		let html = "";
		this.events.forEach(event => {
			if(event.name.toLowerCase().trim().includes(name.toLowerCase().trim())){
				html += `
				<div id="${event._id}" class="rex-border-bottom-lightgray rex-selectable-item-background rex-hover">
					<div class="custom-responsive-container">
						<div class="custom-responsive-grid rex-display-grid2">
							<div>
								<p class="rex-mt-16px rex-mb-16px custom-responsive-paragraph rex-color-black rex-fs-normal">
								${event.name}</p>
							</div>
							<div>
								<p class="rex-fs-small rex-color-darkgray rex-mt-16px rex-mb-16px">
									${event.description}
								</p>
							</div>
						</div>
					</div>
				</div>
				`;
				filteredEvents.push(event);
			}
		});

		getEventListContainer().innerHTML = html;

		if(filteredEvents.length > 0){
			filteredEvents.forEach(event => {
				document.getElementById(event._id).onclick = () => {
					dashboardDisplay.displaySwitcher.open(new EventLevelOneDisplay(this.project, this.page, event));
				};
			});
			this.showEventContainer();
		}else{
			getNoEventContainer().querySelector('p').textContent = `'${name}' could not be found`;
			this.showNoEventContainer();
		}
	}

	showEventContainer(){
		getEventListContainer().style.display = "block";
		getNoEventContainer().style.display = "none";
	}

	showNoEventContainer(){
		getEventListContainer().style.display = "none";
		getNoEventContainer().style.display = "block";
	}
}

class PageSettingsLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project, page){
		super();
		this.project = project;
		this.page = page;
	}

	open(){
		LevelThreeDisplay.HideLevelThreeProgressContainer();

		this.hookToPageUpdateListener();
		this.setupPageInfo();
		this.setupDeletePage();

		LevelThreeDisplay.OpenLevelThreeDisplayContainer(3);
	}

	hookToPageUpdateListener(){
		dashboardDisplay.pageHandler.subject.listeners.push(this.pageUpdated.bind(this));
	}

	unhookFromPageUpdateListener(){
		// remove entry which was added from array.
		dashboardDisplay.pageHandler.subject.listeners.pop();
	}

	pageUpdated(page){
		// here you update all the fields with the new page data
		this.page = page;
		getSettingsPageNameInput().value = page.name;
	}

	setupPageInfo(){
		getSettingsPageNameInput().value = this.page.name;

		getSettingsUpatePageBtn().onclick = () => {

			let pageName = escapeHTML(getSettingsPageNameInput().value.trim());

			if(!pageName){
				showError(getSettingsUpdatePageErrorMessage(), "Please enter the page name");
				getSettingsPageNameInput().focus();
				return;
			}
			if(pageName == this.page.name){
				showError(getSettingsUpdatePageErrorMessage(), "Page name is already up-to-date");
				return;
			}
			
			const choiceDialog = new ChoiceDialog({
				message: "Are you sure?",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.updatePageName(pageName);
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	updatePageName(name){
		let data = { pageName: name, apiKey: sessionStorage.getItem("apiKey"), projectId: this.project._id, pageId: this.page._id };
		let url = getHostUrl() + "page/updatePage";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Page updated successfully",
					btnLabel: "OK",
					onclick: (dg) => {
						dashboardDisplay.pageHandler.update(json.page);
						dg.hide();
					}
				});
				alertDialog.show();
			}else{
				showError(getSettingsUpdatePageErrorMessage(), json.error, 8000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			showError(getSettingsUpdatePageErrorMessage(), err, 8000);
		});
	}

	setupDeletePage(){
		getSettingsDeletePageBtn().onclick = () => {
			const choiceDialog = new ChoiceDialog({
				message: "<p style='color:red;'>Delete page. Are you sure?</p>",
				btnLabel1: "Yes",
				btnLabel2: "Cancel",
				onclickBtn1: (dg) => {
					this.deletePage();
					dg.hide();
				},
				onclickBtn2: (dg) => {
					dg.hide();
				}
			});
			choiceDialog.show();
		};
	}

	deletePage(){

		let data = { apiKey: sessionStorage.getItem("apiKey"), projectId: this.project._id, pageId: this.page._id  };
		let url = getHostUrl() + "page/deletePage";

		DashboardDisplay.ShowProgressContainer();

		sendPostRequest(url, data)
		.then(json => {
			if(json.status == "success"){
				const alertDialog = new AlertDialog({
					alert: "Page deleted successfully.",
					btnLabel: "OK",
					onclick: (dg) => {
						DashboardDisplay.HideProgressContainer();
						dashboardDisplay.displaySwitcher.open(new AllPagesLevelOneDisplay(this.project));
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
		this.unhookFromPageUpdateListener();
		getSettingsPageNameInput().value = "";
	}
}

class EventLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project, page, event){
		super();
		this.project = project;
		this.page = page;
		this.event = event;
	}

	open(){
		LevelThreeDisplay.HideLevelThreeProgressContainer();
		LevelThreeDisplay.OpenLevelThreeDisplayContainer(4);
	}

	close(){

	}
}

class EventSettingsLevelThreeDisplay extends LevelThreeDisplay {
	constructor(project, page, event){
		super();
		this.project = project;
		this.page = page;
		this.event = event;
	}

	open(){
		LevelThreeDisplay.HideLevelThreeProgressContainer();
		LevelThreeDisplay.OpenLevelThreeDisplayContainer(5);
	}

	close(){
		
	}
}