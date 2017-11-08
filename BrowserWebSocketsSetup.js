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
      /*
      $tw.hooks.addHook("th-saving-tiddler",function(tiddler) {
        // We add the same actions as cancelling editing here
        console.log('Save Hook');
        // Save the tiddler to the file system
        var message = JSON.stringify({messageType: 'saveTiddler', tiddler: tiddler});
        console.log(message)
        $tw.socket.send(message);

        // Finish the editing part
        var message = JSON.stringify({messageType: 'cancelEditingTiddler', tiddler: tiddler.fields.title});
        console.log(message);
        $tw.socket.send(message);

        // do the normal saving actions for the event
        return tiddler;
      });
      */
      /*
        For the th-deleting-tiddler hook send the deleteTiddler message along
        with the tiddler object.
      */
      /*
      $tw.hooks.addHook("th-deleting-tiddler",function(tiddler) {
        console.log('Delete Hook');
        var message = JSON.stringify({messageType: 'deleteTiddler', tiddler: tiddler});
        $tw.socket.send(message);
        // do the normal deleting actions for the event
        return true;
      });
      */
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

      // Listen out for changes to tiddlers
      $tw.Gatekeeper = $tw.Gatekeeper || {};
      $tw.Gatekeeper.ExcludeList = $tw.Gatekeeper.ExcludeList || [];
      if ($tw.Gatekeeper.ExcludeList.indexOf('$:/StoryList') === -1) {
        $tw.Gatekeeper.ExcludeList.push('$:/StoryList');
      }
      if ($tw.Gatekeeper.ExcludeList.indexOf('$:/HistoryList') === -1) {
        $tw.Gatekeeper.ExcludeList.push('$:/HistoryList');
      }
    	$tw.wiki.addEventListener("change",function(changes) {
        Object.keys(changes).forEach(function(tiddlerTitle) {
          if ($tw.Gatekeeper.ExcludeList.indexOf(tiddlerTitle) === -1 && !tiddlerTitle.startsWith('$:/state/') && !tiddlerTitle.startsWith('$:/temp/')) {
            if (changes[tiddlerTitle].modified) {
              console.log('Modified/Created Tiddler');
              var tiddler = $tw.wiki.getTiddler(tiddlerTitle);
              var message = JSON.stringify({messageType: 'saveTiddler', tiddler: tiddler});
              $tw.socket.send(message);
            } else if (changes[tiddlerTitle].deleted) {
              console.log('Deleted Tiddler');
              var message = JSON.stringify({messageType: 'deleteTiddler', tiddler: tiddlerTitle});
              $tw.socket.send(message);
            }
          }
        });
    	});
    }
    // Send the message to node using the websocket
    setup();
  }
})();
