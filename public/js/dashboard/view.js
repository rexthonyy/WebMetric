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
		this.update(title, align);
	}

	update(title, align){
		getSimpleLevelOneNavContainerLabel().innerHTML = title;
		if(align)getSimpleLevelOneNavContainerLabel().style.textAlign = align;
		LevelOneDisplay.OpenLevelOneDisplayContainer(0);
	}
}

class NavContainerView extends View {
	constructor(navigationList, callback){
		super(navigationList);
		this.callback = callback;
		this.render();
	}

	clearAllSelection(){
		this.params.forEach(navItem => {
			navItem.isSelected = false;
		});
	}

	selectNavItem(index){
		this.clearAllSelection();
		this.params[index].isSelected = true;
		this.render();
	}

	render(){
		let html = "";
		for(let i = 0; i < this.params.length; i++){
			let title = this.params[i].title;
			let isSelected = this.params[i].isSelected;
			let displayType = isSelected ? "rex-display-block" : "rex-display-gone";
			html += 
			`
				<div id="navItem_${i}" class="rex-display-inline-block rex-height-50px rex-selectable-item-background rex-hover rex-color-black rex-mr-16px">
					<span class="rex-line-height-48px rex-fs-extra-small">${title}</span>
					<div class="rex-background-black ${displayType} rex-height-2px"></div>
				</div>
			`;
		}

		getNavListContainer().innerHTML = html;

		for(let i = 0; i < this.params.length; i++){
			document.getElementById(`navItem_${i}`).onclick = () => {
				this.callback(i);
			};
		}
	}
}

