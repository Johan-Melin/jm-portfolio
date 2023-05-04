var controls = {
	jump: false,
	left: false,
	right: false,
	shoot: false
}

document.onkeydown = function(e) {
	e = e || window.event;
	if(e.keyCode == 17)
		controls.ctrl = true;
	if(e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 87)
		controls.jump = true;
	if(e.keyCode == 37 || e.keyCode == 65)
		controls.left = true;
	if(e.keyCode == 39 || e.keyCode == 68)
		controls.right = true;
}

document.onkeyup = function(e) {
	e = e || window.event;
	if(e.keyCode == 17)
		controls.ctrl = false;
	if(e.keyCode == 32 || e.keyCode == 38 || e.keyCode == 87)
		controls.jump = false;
	if(e.keyCode == 37 || e.keyCode == 65)
		controls.left = false;
	if(e.keyCode == 39 || e.keyCode == 68)
		controls.right = false;
}
