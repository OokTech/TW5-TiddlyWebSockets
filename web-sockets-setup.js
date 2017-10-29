/*\
title: $:/plugins/OokTech/TiddlyWebSockets/web-sockets-setup.js
type: application/javascript
module-type: startup

Startup Actions Script thing

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

  var messageHandlers = messageHandlers || {};

  messageHandlers.makeTiddler = function(data) {
    // The title must exist and must be a string, everything else is optional
    if (data.fields) {
      if (typeof data.fields.title === 'string') {
        $tw.wiki.addTiddler(new $tw.Tiddler(data.fields));
      }
    }
  }

  exports.startup = function() {
    // Do all actions on startup.
    function setup() {
      var IPTiddler = $tw.wiki.getTiddler("$:/ServerIP");
      var IPAddress = IPTiddler.fields.text;
      $tw.socket = new WebSocket(`ws://${IPAddress}:8000`);
      $tw.socket.onopen = openSocket;
      $tw.socket.onmessage = parseMessage;
      $tw.socket.binaryType = "arraybuffer";
    }
    /*
      If anything needs to be done to set things up when a socket is opened
      put it in this function
    */
    var openSocket = function() {

    }

    /*
      This is a wrapper function, each message from the websocket server has a
      message type and if that message type matches a handler that is defined
      than the data is passed to the handler function.
    */
    var parseMessage = function(event) {
      console.log(event);
      var eventData = JSON.parse(event.data);
      if (eventData.messageType) {
        messageHandlers[eventData.messageType](eventData);
      }
    }

    // Send the message to node using the websocket
    setup();
  }

})();