/*\
title: $:/plugins/OokTech/TiddlyWebSockets/BrowserWebSocketsSetup.js
type: application/javascript
module-type: startup

This is the browser component for the web sockets. It works with the node web
socket server, but it can be extended for use with other web socket servers.

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

  exports.startup = function() {
    // Do all actions on startup.
    function setup() {
      var IPTiddler = $tw.wiki.getTiddler("$:/ServerIP");
      var IPAddress = IPTiddler.fields.text;
      $tw.socket = new WebSocket(`ws://${IPAddress}:8000`);
      $tw.socket.onopen = openSocket;
      $tw.socket.onmessage = parseMessage;
      $tw.socket.binaryType = "arraybuffer";

      addHooks();
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
      var eventData = JSON.parse(event.data);
      console.log("Event data: ",event.data)
      if (eventData.type) {
        if (typeof $tw.browserMessageHandlers[eventData.type] === 'function') {
          console.log(Object.keys($tw.browserMessageHandlers))
          $tw.browserMessageHandlers[eventData.type](eventData);
        }
      }
    }

    /*
      This adds actions for the different event hooks. Each hook sends a
      message to the node process.
    */
    var addHooks = function() {
      /*
        For the th-saving-tiddler hook send the saveTiddler message along with
        the tiddler object.
      */
      $tw.hooks.addHook("th-saving-tiddler",function(tiddler) {
        console.log('Save Hook');
        var message = JSON.stringify({messageType: 'saveTiddler', tiddler: tiddler});
        $tw.socket.send(message);
        // do NOT do the normal saving actions for the event
        return tiddler;
      });
      /*
        For the th-deleting-tiddler hook send the deleteTiddler message along
        with the tiddler object.
      */
      $tw.hooks.addHook("th-deleting-tiddler",function(tiddler) {
        console.log('Delete Hook');
        var message = JSON.stringify({messageType: 'deleteTiddler', tiddler: tiddler});
        $tw.socket.send(message);
        // do the normal deleting actions for the event
        return true;
      });
      $tw.hooks.addHook("th-editing-tiddler", function(event) {
        console.log('Editing tiddler event: ', event);
        var message = JSON.stringify({messageType: 'editingTiddler', tiddler: event.tiddlerTitle});
        $tw.socket.send(message);
        // do the normal editing actions for the event
        return true;
      })
      /*
      $tw.hooks.addHook("th-new-tiddler", function(event) {
        console.log("new tiddler hook: ", event);
        return event;
      })
      $tw.hooks.addHook("th-navigating", function(event) {
        console.log("navigating event: ",event);
        return event;
      })
      */
      $tw.hooks.addHook("th-cancelling-tiddler", function(event) {
        console.log("cancel editing event: ",event);
        var message = JSON.stringify({messageType: 'cancelEditingTiddler', tiddler: event.tiddlerTitle});
        $tw.socket.send(message);
        return event;
      })
      /*
      th-importing-tiddler
      th-relinking-tiddler
      th-renaming-tiddler
      */
    }
    // Send the message to node using the websocket
    setup();
  }
})();
