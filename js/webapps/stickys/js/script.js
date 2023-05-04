var db = null;
/*document.ontouchmove = function(e){ 
    e.preventDefault(); 
}*/

function touchHandler(event) {
    var touch = event.changedTouches[0];

    var simulatedEvent = document.createEvent("MouseEvent");
        simulatedEvent.initMouseEvent({
        touchstart: "mousedown",
        touchmove: "mousemove",
        touchend: "mouseup"
    }[event.type], true, true, window, 1,
        touch.screenX, touch.screenY,
        touch.clientX, touch.clientY, false,
        false, false, false, 0, null);

    touch.target.dispatchEvent(simulatedEvent);
}

function init() {
    document.addEventListener("touchstart", touchHandler, true);
    document.addEventListener("touchmove", touchHandler, true);
	document.addEventListener("touchend", touchHandler, true);
	document.addEventListener("touchcancel", touchHandler, true);
}

if(window.openDatabase){
	db = openDatabase("NoteTest","1.0","Stickys Database",10000000);
	if(!db){
		alert("Failed to open database");
	}
}else{
	alert("This application uses 'Web SQL Database' which isn't supported by Firefox or Inernet Explorer :(");
}

var capture = null;
var highestZ = 0;
var highestId = 0;

var colorlist = ['#fe4', '#be4', '#4e7', '#4eb', '#4ce', '#a4e', '#c4e', '#e4b', '#e45', '#84e'];
var footerlist = ['#ba2', '#8a2', '#2a4', '#2a9', '#29a', '#82a', '#92a', '#a29', '#a23', '#52a'];

function Note(){
	var self = this;
	
	var note = document.createElement('div');
	note.className = 'note';
	note.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
	note.addEventListener('click', function() { return self.onClickNote() }, false);
	this.note = note;
	
	var close = document.createElement('div');
	close.className = 'closebutton';
	close.addEventListener('click', function(event) { return self.close(event) }, false);
	note.appendChild(close);

	var color = document.createElement('div');
	color.className = 'colorbutton';
	color.addEventListener('click', function(event) { return self.changeColor(event) }, false);
	note.appendChild(color);
	
	var edit = document.createElement('div');
	edit.className = 'edit';
	edit.setAttribute('contenteditable', true);
	edit.addEventListener('keyup', function() { return self.onKeyUp() }, false);
	note.appendChild(edit);
	this.editField = edit;
	
	var ts = document.createElement('div');
	ts.className = 'timestamp';
	ts.addEventListener('mousedown', function(e) { return self.onMouseDown(e) }, false);
	note.appendChild(ts);
	this.lastModified = ts;
	
	document.body.appendChild(note);
	return this;
}

Note.prototype = {
	get id(){
		if(!("_id" in this))
			this._id = 0;
		return this._id;
	},
	
	set id(x){
		this._id = x;
	},
	
	get text(){
		return this.editField.innerHTML;
	},
	
	set text(x){
		this.editField.innerHTML = x;
	},
	
	get timestamp(){
		if(!("_timestamp" in this))
			this._timestamp = 0;
		return this._timestamp;
	},
	
	set timestamp(x){
		if(this._timestamp == x){
			return;
		}
		this._timestamp = x;
		var date = new Date();
		date.setTime(parseFloat(x));
		this.lastModified.textContent = modifiedString(date);
	},
	
	get left(){
		return this.note.style.left;
	},
	
	set left(x){
		this.note.style.left = x;
	},
	
	get top(){
		return this.note.style.top;
	},
	
	set top(x){
		this.note.style.top = x;
	},
	
	get zIndex(){
		return this.note.style.zIndex;
	},
	
	set zIndex(x){
		this.note.style.zIndex = x;
	},
	
	get bgColor(){
		if(!("_bgColor" in this))
			this._bgColor = 0;
		return this._bgColor;
	},
		
	set bgColor(x){
		this._bgColor = x;
	},
	
	close: function(event){
		this.cancelPendingSave();
		var note = this;
		db.transaction(function(tx){
			tx.executeSql("DELETE FROM Mystickys WHERE id = ?",[note.id]);
		});
		document.body.removeChild(this.note);
	},
	
	changeColor: function(event){
		var clr = this.bgColor;
		clr++;
		if(clr > 8)
			clr = 0;
		this.bgColor = clr;
		this.getColor();
	},
	
	getColor: function(event){
		var clr = this.bgColor;
		this.note.style.background = colorlist[clr];
		this.lastModified.style.background = footerlist[clr];
	},
	
	saveSoon: function(){
		this.cancelPendingSave();
		var self = this;
		this._saveTimer = setTimeout(function() { self.save() },200);		
	},
	
	cancelPendingSave: function(){
		if(!("_saveTimer" in this))
			return;
		clearTimeout(this._saveTimer);
		delete this._saveTimer;
	},
	
	save: function(){
		this.cancelPendingSave();
		
		if("dirty" in this){
			this.timestamp = new Date().getTime();
			delete this.dirty;
		}
		
		var note = this;
		db.transaction(function(tx){
			tx.executeSql("UPDATE Mystickys SET note = ?, timestamp = ?, left = ?, top = ?, zIndex = ?, bgColor = ? WHERE id = ?",
			[note.text, note.timestamp, note.left, note.top, note.zIndex, note.bgColor, note.id]);
		});
	},
	
	saveAsNew: function(){
		this.timestamp = new Date().getTime();
		
		var note = this;
		db.transaction(function(tx){
			tx.executeSql("INSERT INTO Mystickys (id, note, timestamp, left, top, zIndex, bgColor) VALUES(?, ?, ?, ?, ?, ?, ?)",
			[note.id, note.text, note.timestamp, note.left, note.top, note.zIndex, note.bgColor]);
		});
	},
		
	onMouseDown: function(e){
		capture = this;
		this.startX = e.clientX - this.note.offsetLeft;
		this.startY = e.clientY - this.note.offsetTop;
		this.zIndex = ++highestZ;
		
		var self = this;
		if(!("mouseMoveHandler" in this)){
			this.mouseMoveHandler = function(e) { return self.onMouseMove(e) }
			this.mouseUpHandler = function(e) { return self.onMouseUp(e) }
		}
		
		document.addEventListener('mousemove', this.mouseMoveHandler, true);
		document.addEventListener('mouseup', this.mouseUpHandler, true);
		
		return false;
	},

	onMouseMove: function(e){
		if(this != capture){
			return true;
		}
		this.left = e.clientX - this.startX + 'px';
		this.top = e.clientY - this.startY + 'px';
		return false;
	},
	
	onMouseUp: function(e){

		document.removeEventListener('mousemove', this.mouseMoveHandler, true);		
		document.removeEventListener('mouseup', this.mouseUpHandler, true);		
		
		this.save();
		return false;
	},
	
	onClickNote: function(e){
		this.editField.focus();
		getSelection().collapseToEnd()
	},
	
	onKeyUp: function(){
		this.dirty = true;
		this.saveSoon();
	}
}

function loaded(){
	db.transaction(function(tx){
		tx.executeSql("SELECT COUNT(*) FROM Mystickys", [], function(result){
			loadNotes();
		}, function(tx, error){
			tx.executeSql("CREATE TABLE Mystickys (id REAL UNIQUE, note TEXT, timestamp REAL, left TEXT, top TEXT, zIndex REAL, bgColor REAL)",[], function(result){
				loadNotes();
			});
		});
	});
}

function loadNotes(){
	db.transaction(function(tx){
		tx.executeSql("SELECT id, note, timestamp, left, top, zIndex, bgColor FROM Mystickys", [], function(tx, result){
			for (var i = 0; i < result.rows.length; ++i){
				var row = result.rows.item(i);
				var note = new Note();
				note.id = row['id'];
				note.text = row['note'];
				note.timestamp = row['timestamp'];
				note.left = row['left'];
				note.top = row['top'];
				note.zIndex = row['zIndex'];
				note.bgColor = row['bgColor'];
				note.getColor();
				
                if(row['id'] > highestId)
                    highestId = row['id'];
				if(row['zIndex'] > highestZ)
					highestZ = row['zIndex'];
			}
			if(!result.rows.length){
				newNote();
			}
		}, function(tx, error){
			alert("Failed to get notes = "+error.message);
			return;
		});
    });
}

function modifiedString(date){
	return "Sticky Last Modified: " + date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
}

function newNote(){
	var note = new Note();
	note.id = ++highestId;
	note.timeStamp = new Date().getTime();
	note.left = Math.round(Math.random() * 400) + "px";
	note.top = Math.round(Math.random() * 500) + "px";
    note.zIndex = ++highestZ;
	note.bgColor = 0;
	note.saveAsNew();
}

if(db != null){
	addEventListener('load', loaded, false);
}

init();
