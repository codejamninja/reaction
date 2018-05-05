import Promise from 'bluebird';
import _ from 'lodash';
import easycp from 'easycp';
import ora from 'ora';
import buildAndroid from '../build/android';
import createConfig from '../../createConfig';
import log from '../../log';

export default async function publishAndroid(options, config) {
  if (!config) {
    config = createConfig({ defaultEnv: 'production', options });
    log.debug('options', options);
    log.debug('config', config);
  }
  const spinner = ora('publishing android\n').start();
  await buildAndroid(options, config);
  if (_.get(config, 'publish.android')) {
    await Promise.mapSeries(config.publish.android, async script => {
      await easycp(script);
    });
  }
  spinner.succeed('published android');
}
