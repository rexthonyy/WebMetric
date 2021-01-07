class View {
	constructor(params){
		this.params = params;
	}

	update(params){}
}

class ProfileDropdownView extends View {
	constructor(params){
		super(params);
		this.setup();
		this.setClickListeners();
		this.update(params.user);
	}

	setup(){
		this.isDropdownVisible = true;
		this.toggleProfileDropdown();
	}

	setClickListeners(){
		getUserProfileDropdownIcon().onclick = (e) => {
			stopClickPropagation(e);
			this.toggleProfileDropdown();
		};

		getProfileDropdownIconContainer().onclick = () => {
			dashboardDisplay.displaySwitcher.open(new SettingsLevelOneDisplay());
		};

		getProfileDropdownAccountSettingsMenuBtn().onclick = () => {
			dashboardDisplay.displaySwitcher.open(new SettingsLevelOneDisplay());
		};

		getProfileDropdownSignoutMenuBtn().onclick = () => {
			sessionStorage.removeItem("apiKey");
			window.open("index.html", "_self");
		};
	}

	toggleProfileDropdown(){
		if(this.isDropdownVisible){
			ProfileDropdownView.HideProfileDropdown();
			window.onclick = () => {};
		}else{
			ProfileDropdownView.ShowProfileDropdown();
			window.onclick = () => {
				this.toggleProfileDropdown();
			}
		}
		this.isDropdownVisible = !this.isDropdownVisible;
	}

	update(user){
		this.params.user = user;
		getProfileDropdownName().textContent = user.username;
		getProfileDropdownEmail().textContent = user.email;
	}

	static ShowProfileDropdown(){
		getProfileDropdown().style.display = "block";
	}

	static HideProfileDropdown(){
		getProfileDropdown().style.display = "none";
	}
}

class SimpleLevelOneNavContainerView extends View {
	constructor(title, align){
		super(title);
		getSimpleLevelOneNavContainerLabel().textContent = title;
		if(align)getSimpleLevelOneNavContainerLabel().style.textAlign = align;
		LevelOneDisplay.OpenLevelOneDisplayContainer(0);
	}
}