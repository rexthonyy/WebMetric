class Dialog {
	constructor(args){
		this.params = args;
	}

	show(){}
	hide(){}

	static ShowModalBackground(){
		getModalBackground().style.display = "flex";
	}

	static HideModalBackground(){
		getModalBackground().style.display = "none";
	}
	
}

class AlertDialog extends Dialog {
	constructor(args){
		super(args);
	}

	show(){
		getAlertModalMessage().textContent = this.params.alert;
		getAlertModalBtn().textContent = this.params.btnLabel;
		getAlertModalBtn().onclick = () => {
			this.params.onclick(this);
		};

		AlertDialog.ShowAlertModal();
	}

	hide(){
		AlertDialog.HideAlertModal();
	}

	static ShowAlertModal(){
		Dialog.ShowModalBackground();
		getAlertModal().style.display = "block";
	}

	static HideAlertModal(){
		Dialog.HideModalBackground();
		getAlertModal().style.display = "none";
	}
}