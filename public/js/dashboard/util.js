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
