class Subject {
	constructor(listeners){
		this.listeners = listeners;
	}

	notifyObservers(data){
		this.listeners.forEach(listener => {
			listener(data);
		});
	}
}