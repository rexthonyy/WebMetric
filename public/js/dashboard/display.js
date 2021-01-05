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
				this.showError("Enter the name of your project");
				getProjectNameInput().focus();
				return;
			}

			this.createProject(name);
		};
	}

	showError(error, duration = 3000){
		let errorMessage = getCreateProjectErrorMessage();
		errorMessage.textContent = error;
		errorMessage.style.display = "block";
		wait(duration, () => {
			errorMessage.style.display = "none";
		});
	}

	createProject(name){

		let data = { name: name, apiKey: sessionStorage.getItem("apiKey") };
		let url = getHostUrl() + "project/createProject";

		DashboardDisplay.ShowProgressContainer();

		let _this = this;

		sendPostRequest(url, data)
		.then(json => {
			DashboardDisplay.HideProgressContainer();
			if(json.status == "success"){
				dashboardDisplay.displaySwitcher.open(new AllProjectsLevelOneDisplay());
			}else{
				_this.showError(json.error, 5000);
			}
		}).catch(err => {
			DashboardDisplay.HideProgressContainer();
			console.error(err);
			_this.showError(err, 5000);
		});
	}
}

class SettingsLevelTwoDisplay extends LevelTwoDisplay {
	constructor(){
		super();
	}

	open(){
		LevelTwoDisplay.HideLevelTwoProgressContainer();
		LevelTwoDisplay.OpenLevelTwoDisplayContainer(2);
	}
}