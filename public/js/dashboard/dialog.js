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
		getAlertModalMessage().innerHTML = this.params.alert;
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

class ChoiceDialog extends Dialog {
	constructor(args){
		super(args);
	}

	show(){
		getChoiceModalMessage().innerHTML = this.params.message;
		getChoiceModalBtn1().textContent = this.params.btnLabel1;
		getChoiceModalBtn2().textContent = this.params.btnLabel2;
		getChoiceModalBtn1().onclick = () => {
			this.params.onclickBtn1(this);
		};
		getChoiceModalBtn2().onclick = () => {
			this.params.onclickBtn2(this);
		};
		
		ChoiceDialog.ShowChoiceModal();
	}

	hide(){
		ChoiceDialog.HideChoiceModal();
	}

	static ShowChoiceModal(){
		Dialog.ShowModalBackground();
		getChoiceModal().style.display = "block";
	}

	static HideChoiceModal(){
		Dialog.HideModalBackground();
		getChoiceModal().style.display = "none";
	}
}

class InputDialog extends Dialog {
	constructor(args){
		super(args);
	}

	show(){
		getInputModalMessage().innerHTML = this.params.message;
		getInputModalInput().value = this.params.input;
		getInputModalInput().placeholder = this.params.placeholder;
		getInputModalBtn1().textContent = this.params.btnLabel1;
		getInputModalBtn2().textContent = this.params.btnLabel2;
		getInputModalBtn1().onclick = () => {
			this.params.onclickBtn1(this);
		};
		getInputModalBtn2().onclick = () => {
			this.params.onclickBtn2(this);
		};
		
		InputDialog.ShowInputModal();
	}

	getInput(){
		return getInputModalInput().value;
	}

	showError(msg, duration=3000){
		showError(getInputModalErrorMessage(), msg, duration);
	}

	hide(){
		InputDialog.HideInputModal();
	}

	static ShowInputModal(){
		Dialog.ShowModalBackground();
		getInputModal().style.display = "block";
	}

	static HideInputModal(){
		Dialog.HideModalBackground();
		getInputModal().style.display = "none";
	}
}

