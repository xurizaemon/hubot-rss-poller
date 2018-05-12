'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = scriptLoader;
// Temporarily needed until the folowing two issues are resolved:
//   https://github.com/github/hubot/issues/851
//   https://github.com/github/hubot/issues/858
//
var scriptPath = __dirname;
var fileName = 'poller-script.js';

function scriptLoader(robot) {
  robot.loadFile(scriptPath, fileName);
}
module.exports = exports['default'];