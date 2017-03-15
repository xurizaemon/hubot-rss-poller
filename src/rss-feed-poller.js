import NodePie from 'nodepie';
import request from 'request-promise';

export default function getFeed(options) {
  let lastTime = 0;
  async function checkFeed() {
    const time = new Date().getTime();
    options.robot.logger.debug(`Checking ${options.name || 'unnamed feed'} at ${time}`);
    const env = process.env;
    const username = options.username || env.HUBOT_RSS_FEED_USERNAME;
    const password = options.password || env.HUBOT_RSS_FEED_PASSWORD;

    const authString = `${username}:${password}`;
    let credentials = {};
    if (username && password || (options.request.headers
                                 && options.request.headers.Authorization)) {
      credentials = {
        headers: {
          Authorization: `Basic ${new Buffer(authString).toString('base64')}`,
        },
      };
    }

    const requestResult = await request({
      ...options.request,
      ...credentials,
    });

    const feedResult = new NodePie(requestResult);

    try {
      feedResult.init();
    } catch (err) {
      options.robot.logger.debug(`${err.message}`);
    }

    const latestItem = feedResult.getItem(0);
    if (latestItem) {
      const itemPostedTime = latestItem.getUpdateDate();
      options.robot.logger.debug(`${itemPostedTime}`);
      if (itemPostedTime >= lastTime) {
        options.robot.logger.debug(`Found update for: ${latestItem.getTitle()}`);
        options.robot.messageRoom(
          options.room,
          `${options.alertPrefix || ''}${latestItem.getTitle()} - ${latestItem.getPermalink()}` +
            `${options.alertSuffix || ''}`
        );
      }
    }

    lastTime = time;
  }

  function startFeed() {
    options.robot.logger.info(`Starting feed poller for ${options.name}.`);
    setTimeout(() => {
      checkFeed();

      setInterval(checkFeed, options.pingInterval * 1000);
    }, (options.initialDelay || 3) * 1000);
  }

  return {
    checkFeed,
    startFeed,
  };
}
