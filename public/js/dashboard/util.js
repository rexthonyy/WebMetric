async function sendGetRequest(url){
    let response = await fetch(url);
    let json = await response.json();

	return json;
}

async function sendPostRequest(url, data){
	let response = await fetch(url, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(data)
	});
	
	let json = await response.json();

	return json;
}

function getHostUrl(){
	return window.location.protocol + "//" + window.location.host + "/";
}

function stopClickPropagation(e){
	if(!e) e = window.event;
	if(e.stopPropagation){
		e.stopPropagation();
	}else{
		e.cancelBubble = true;
	}
}

function wait(time, func){
	setTimeout(() => {
		func();
	}, time);
}

function showError(elm, msg, duration = 3000){
	elm.textContent = msg;
	elm.style.display = "block";
	wait(duration, () => {
		elm.style.display = "none";
	});
}

function isEmailValid(email){
	const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function escapeHTML(unsafeInput){
	return unsafeInput
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}