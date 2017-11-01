/*\
title: $:/plugins/OokTech/TiddlyWebSockets/NodeMessageHandlers.js
type: application/javascript
module-type: startup

These are message handler functions for the web socket servers. Use this file
as a template for extending the web socket funcitons.
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
  console.log(data);
  $tw.GateKeeper.saveTiddler(data.tiddler);
}

})()
