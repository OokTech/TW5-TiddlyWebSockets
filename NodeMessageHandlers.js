/*\
title: $:/plugins/OokTech/TiddlyWebSockets/NodeMessageHandlers.js
type: application/javascript
module-type: startup

These are message handler functions for the web socket servers. Use this file
as a template for extending the web socket funcitons.

This handles messages sent to the node process.
\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

// This lets you add to the $tw.nodeMessageHandlers object without overwriting
// existing handler functions
$tw.nodeMessageHandlers = $tw.nodeMessageHandlers || {};

$tw.BrowserTiddlerList = $tw.BrowserTiddlerList || {};

/*
  This handles when the browser sends the list of all tiddlers that currently
  exist in the browser version of the wiki. This is different than the list of
  all tiddlers in files.
*/
$tw.nodeMessageHandlers.browserTiddlerList = function(data) {
  // Save the list of tiddlers in the browser as part of the $tw object so it
  // can be used elsewhere.
  $tw.BrowserTiddlerList[data.source_connection] = data.titles;
}

/*
  This is just a test function to make sure that everthing is working.
  It just displays the contents of the data in the console.
*/
$tw.nodeMessageHandlers.test = function(data) {
  console.log(data);
}

$tw.nodeMessageHandlers.saveTiddler = function(data) {
  console.log('Node Save Tiddler');
  if ($tw.Gatekeeper.EditingTiddlers[data.tiddler.fields.title]) {
    delete $tw.Gatekeeper.EditingTiddlers[data.tiddler.fields.title];
    $tw.Gatekeeper.UpdateEditingTiddlers(false);
  }
  $tw.Gatekeeper.FileSystemFunctions.saveTiddler(data.tiddler);
  $tw.wiki.addTiddler(data.tiddler);
}

$tw.nodeMessageHandlers.deleteTiddler = function(data) {
  //Something here!
  console.log('Node Delete Tiddler');
  if ($tw.Gatekeeper.EditingTiddlers[data.tiddler.fields.title]) {
    delete $tw.Gatekeeper.EditingTiddlers[data.tiddler.fields.title];
    $tw.Gatekeeper.UpdateEditingTiddlers(false);
  }
  $tw.Gatekeeper.FileSystemFunctions.deleteTiddler(data.tiddler.fields.title);
  //$tw.wiki.removeTiddler(data.tiddler);
}

$tw.nodeMessageHandlers.editingTiddler = function(data) {
  console.log('Editing Tiddler');
  $tw.Gatekeeper.UpdateEditingTiddlers(data.tiddler);
}

$tw.nodeMessageHandlers.cancelEditingTiddler = function(data) {
  console.log('Cancel Editing Tiddler ', data);
  var title = data.tiddler.slice(10,-1);
  console.log(title)
  if ($tw.Gatekeeper.EditingTiddlers[title]) {
    delete $tw.Gatekeeper.EditingTiddlers[title];
    $tw.Gatekeeper.UpdateEditingTiddlers(false);
  }
}

})()
