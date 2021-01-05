class ObjectHandler {
	constructor(data, subject){
		this.subject = subject;
		this.update(data);
	}

	update(data){
		this.data = data;
		this.subject.notifyObservers(data);
	}
}