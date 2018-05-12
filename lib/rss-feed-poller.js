'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.default = getFeed;

var _nodepie = require('nodepie');

var _nodepie2 = _interopRequireDefault(_nodepie);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFeed(options) {
  var checkFeed = function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var time, env, username, password, authString, credentials, requestResult, feedResult, latestItem, itemPostedTime, message;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              time = new Date().getTime();

              robot.logger.debug('Checking ' + (options.name || 'unnamed feed') + ' at ' + time);
              env = process.env;
              username = options.username || env.HUBOT_RSS_FEED_USERNAME;
              password = options.password || env.HUBOT_RSS_FEED_PASSWORD;
              authString = username + ':' + password;
              credentials = {};

              if (username && password || options.request.headers && options.request.headers.Authorization) {
                credentials = {
                  headers: {
                    Authorization: 'Basic ' + new Buffer(authString).toString('base64')
                  }
                };
              }

              _context.next = 10;
              return (0, _requestPromise2.default)((0, _extends3.default)({}, options.request, credentials));

            case 10:
              requestResult = _context.sent;
              feedResult = new _nodepie2.default(requestResult);


              try {
                feedResult.init();
              } catch (err) {
                robot.logger.error('' + err.message);
              }

              latestItem = feedResult.getItem(0);

              if (latestItem) {
                itemPostedTime = latestItem.getDate().getTime();

                if (itemPostedTime >= lastTime && lastTitle != latestItem.getTitle()) {
                  lastTitle = latestItem.getTitle();
                  options.robot.logger.debug('Found update for: ' + latestItem.getTitle());
                  message = '' + (options.alertPrefix || '') + latestItem.getTitle() + ' - ' + ('' + latestItem.getPermalink() + (options.alertSuffix || ''));

                  if (Array.isArray(options.room)) {
                    options.room.map(function (x) {
                      return options.robot.messageRoom(x, message);
                    });
                  } else {
                    options.robot.messageRoom(options.room, message);
                  }
                }
              }

              lastTime = time;
              robot.brain.set('rss-poller:' + options.name + ':lastTitle', lastTitle);
              robot.brain.set('rss-poller:' + options.name + ':lastTime', lastTime);

            case 18:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function checkFeed() {
      return _ref.apply(this, arguments);
    };
  }();

  var robot = options.robot;
  var lastTime = robot.brain.get('rss-poller:' + options.name + ':lastTime') || new Date().getTime();
  var lastTitle = robot.brain.get('rss-poller:' + options.name + ':lastTitle') || '';

  function startFeed() {
    options.robot.logger.info('Starting feed poller for ' + options.name + '.');
    setTimeout(function () {
      checkFeed();

      setInterval(checkFeed, options.pingInterval * 1000);
    }, (options.initialDelay || 3) * 1000);
  }

  return {
    checkFeed: checkFeed,
    startFeed: startFeed
  };
}
module.exports = exports['default'];