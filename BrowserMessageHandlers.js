/*\
title: $:/plugins/OokTech/TiddlyWebSockets/BrowserMessageHandlers.js
type: application/javascript
module-type: startup

These are message handlers for messages sent to the browser. If you want to
add more functions the easiest way is to use this file as a template and make a
new file that adds the files you want. To do this you need should copy
everything until the line

$tw.browserMessageHandlers = $tw.browserMessageHandlers || {};

this line makes sure that the object exists and doesn't overwrite what already
exists and it lets the files that define handlers be loaded in any order.

Remember that the file has to end with

})();

to close the function that wraps the contents.
Also change the title of the tiddler in the second line of the file, otherwise
it will overwrite this file.
\*/
(function () {

  /*jslint node: true, browser: true */
  /*global $tw: false */
  "use strict";

  // Export name and synchronous status
  exports.name = "web-sockets-setup";
  exports.platforms = ["browser"];
  exports.after = ["render"];
  exports.synchronous = true;

  $tw.browserMessageHandlers = $tw.browserMessageHandlers || {};

  /*
    TODO - determine if we should sanitise the tiddler titles and field names

    This message handler takes care of makeTiddler messages
    It creates a tiddler out of the supplied JSON object that lists the fields.

    JSON structure of data (the function input):
    {
      "fields": {
        "title": "Some title",
        "other": "field thingy",
        "text": "lots of text and stuff here because why not"
      }
    }
  */
  $tw.browserMessageHandlers.makeTiddler = function(data) {
    console.log('Make Tiddler')
    // The title must exist and must be a string, everything else is optional
    if (data.fields) {
      if (typeof data.fields.title === 'string') {
        console.log('Create Tiddler ', data.fields.title);
        $tw.wiki.addTiddler(new $tw.Tiddler(data.fields));
      } else {
        console.log('Invalid tiddler title');
      }
    } else {
      console.log("No tiddler fields given");
    }
  }

  /*
    This message handles the remove tiddler function. Note that this removes
    the tiddler from the wiki in the browser, but it does not delete the .tid
    file from the node server if you are running tiddlywiki in node.
    If you are running without node than this function is equavalient to deleting the tiddler.
  */
  $tw.browserMessageHandlers.removeTiddler = function(data) {
    // The data object passed must have at least a title
    if (data.title) {
      $tw.wiki.deleteTiddler(data.title);
    } else {
      console.log("No tiddler title give.");
    }
  }

  /*
    This message asks the browser to send a list of all tiddlers back to the
    node process.
    This is useful for when you are trying to sync the browser and the file
    system or if you only want a sub-set of existing tiddlers in the browser.
  */
  $tw.browserMessageHandlers.listTiddlers = function(data) {
    // This is an array of tiddler titles, each title is a string.
    var response = $tw.wiki.allTitles();
    // Send the response JSON as a string.
    $tw.socket.send(JSON.stringify({messageType: 'browserTiddlerList', titles: response}));
  }
})();
