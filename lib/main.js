//This is an active module of the Noteson Add-on
exports.main = function() {

	var data = require("sdk/self").data;
	var ss = require("sdk/simple-storage");

	if(typeof(ss.storage.notes) === 'undefined') {
		ss.storage.notes = [];
		ss.storage.notes[0]="Benvenuto in Noteson!";
	}
	// Create a panel whose content is defined in "text-entry.html".
	var notes = require("sdk/panel").Panel({
		width: 390,
		height: 310,
		contentURL: data.url("note.html"),
		onMessage: function(message) {
			switch(message.method) {
			case 'addNote':
				ss.storage.notes[ss.storage.notes.length] = message.value;
				break;
			case 'modifyNote':
				ss.storage.notes[message.key]=message.value;
				notes.port.emit("listTabReturn", ss.storage.notes);
				break;
			case 'deleteNote':
				delete ss.storage.notes[message.key];
				ss.storage.notes= reindexArray(ss.storage.notes);
				notes.port.emit("listTabReturn", ss.storage.notes);
				break;

			}
		}
	});

	//reindex of storage after deleting
	function reindexArray( array ) {
		var result = [];
		for( var key in array )
			result.push( array[key] );
		return result;
	};
	// Send the page script a message called "show" when the panel is shown.
	notes.on("show", function() {
		notes.port.emit("show");
	});

	//Send the page script a message called "listTabReturn" when the content ask for "listTab"
	notes.port.on("listTab", function() {
		notes.port.emit("listTabReturn", ss.storage.notes);
	});

	// Create a widget, and attach the panel to it, so the panel is
	// shown when the user clicks the widget.
	require("sdk/widget").Widget({
		label: "Notes",
		content: "Notes",
		width: 50,
		id: "notes",
		panel: notes
	});

}