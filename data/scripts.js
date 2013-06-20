addon.port.on("show", function (arg) {
	var textArea = document.getElementById('notes');
	textArea.focus();
	clearNotification();
});

//clear method
function clearNote(){
    var textArea = document.getElementById('notes');
    textArea.value = '';
    textArea.focus();
    clearNotification();
}

//function add note using button
function addNote() {

	var textArea = document.getElementById('notes');
	if (textArea.value.match(/./g)){
		text = clearText(textArea.value);
		document.getElementById("notification").innerHTML = "Note added successfully";
		addon.postMessage({
			method: 'addNote',
			'value': textArea.value
		});
		textArea.value = '';
        textArea.focus();
	} else {
		document.getElementById("notification").innerHTML = "Please enter some text into the note field";
		textArea.focus();
	}
}

//get list notes using tab note
function listTab(){
	addon.port.emit('listTab');
}

addon.port.on('listTabReturn', listTabReturn);

function listTabReturn(storage) {
	var listTab = document.getElementById("list");
	clearNotification();
	document.getElementById("list").className = "attivo";
	document.getElementById("new").className = "";

	document.getElementById("listNotes").innerHTML = listNotes(storage);

	document.getElementById('listNotes').style.zIndex = "1";
	document.getElementById('add').style.zIndex = "-1";
}

//get add tab
function newTab(){
	var newTab = document.getElementById("new");
	clearNotification();
	document.getElementById('new').className = "topcoat-button--large-quiet is-active";
	document.getElementById('list').className = "";
	document.getElementById('listNotes').style.zIndex = "-1";
	document.getElementById('add').style.zIndex = "1";
}


//utility method to clear note text
function clearText(note) {
	note = note.replace(/\n/g, "<br/>");
	note = note.split("<").join("&lt;").split(">").join("&gt;");
	note = note.split("&lt;br/&gt;").join("<br/>");
	note = note.split("&lt;br&gt;").join("<br/>");
	return note;
}

//utility method to render notes's list
function listNotes(storage) {
	var len = storage.length;

	var rowOutput = "";
	for (var i=0; i < len; i++) {
		if(i%2==0)
			parity="pari";
		else
			parity="dispari";
		rowOutput += renderTodo(storage[i],parity,i);
	}
	return rowOutput;
}

function renderTodo(row, parity, index) {
	return "<div class='"+parity+"' id='"+index+"'>"+row+"<p class='link'><a name='modify"+index+"' href='javascript:modifyNote("+index+")'>Modify</a> <a href='javascript:deleteNote("+index+")'>Delete</a></p></div>";
}

function clearNotification() {
	document.getElementById('notification').innerHTML = "";
}

/* modify note using javascript in the note-entry.html page
 * this method take the div element that contain the single note and
 * replace a text area to modify the note before save it
 */
function modifyNote(id) {

	document.getElementById('notification').innerHTML = "";

	link = document.getElementsByName("modify" + id)[0].text;
	if (link == "Modify") {
		var message = document.getElementById(id).innerHTML.replace(/<(a|p).*>/i, '');

		document.getElementsByName("modify" + id)[0].innerHTML = "Save";
		var txt = document.createElement('textarea');

		old = document.getElementById(id).firstChild;
		document.getElementById(id).insertBefore(txt, old);

		message = message.split("<br>").join("\n");
		message = message.split("<br/>").join("\n");
		document.getElementById(id).firstChild.value = message;
		document.getElementById(id).firstChild.cols = 35;
		document.getElementById(id).firstChild.rows = 5;
		document.getElementById(id).firstChild.focus();
		node = old.nextSibling;
		while (old.nextSibling.nodeName != "P") {
			document.getElementById(id).removeChild(node);
			node = old.nextSibling;
		}
		document.getElementById(id).removeChild(old);

	} else {
		document.getElementsByName("modify" + id)[0].innerHTML = "Modify";
		var temp = document.getElementById(id).firstChild.value;
		temp = clearText(temp);

		addon.postMessage({
			method: 'modifyNote',
			'key': id,
			'value':temp
		});
		addon.port.on('listTabReturn', function(storage) {
			document.getElementById("listNotes").innerHTML = listNotes(storage);
		});
		document.getElementById('notification').innerHTML = "Note modified successfully";
	}

}

//Send a message to Addon script using postMessage for deleting
//the selected note and waits for "listTabReturn" from the addon
function del(id) {
	addon.postMessage({
		method: 'deleteNote',
		'key': id,
	});
	addon.port.on('listTabReturn', function(storage) {
		document.getElementById("listNotes").innerHTML = listNotes(storage);

	});

}


function deleteNote(id) {
	if (navigator.platform.indexOf("Win") > -1) {
		var answer = confirm("Are you sure?");
		if (answer) {
			del(id);
		}
	} else {
		del(id);
	}
}
