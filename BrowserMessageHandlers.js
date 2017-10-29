/*\
title: $:/plugins/OokTech/TiddlyWebSockets/BrowserMessageHandlers.js
type: application/javascript
module-type: startup



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
        $tw.wiki.addTiddler(new $tw.Tiddler(data.fields));
      }
    }
  }
})();
