class DisplaySwitcher {
	constructor(){
		this.activeDisplay = null;
	}

	open(display){
		if(this.activeDisplay){
			this.activeDisplay.close();
		}
		display.open();
		this.activeDisplay = display;
	};
}