import Cookies from 'cookies-js';
import React from 'react';
import ignoreWarnings from 'ignore-warnings';
import { persistStore } from 'redux-persist';
import { hydrate } from 'react-dom';
import { config } from '..';
import { createWebStore } from '../createStore';
import log, { setLevel } from '../log';

const { document } = window;

async function renderClient(initialProps) {
  const context = await createWebStore({
    cookieJar: Cookies,
    insertCss: (...styles) => {
      const removeCss = styles.map(style => style._insertCss());
      return () => removeCss.forEach(f => f());
    }
  });
  context.persistor = await new Promise(resolve => {
    const { store } = context;
    const persistor = persistStore(store, config.initialState, () => {
      return resolve(persistor);
    });
  });
  initialProps.context = context;
  const ClientApp = require('~/../web/ClientApp').default;
  hydrate(<ClientApp {...initialProps} />, document.getElementById('app'));
}

export default function client(initialProps = {}) {
  if (!config.options.debug) {
    ignoreWarnings(config.ignore.warnings || []);
    ignoreWarnings('error', config.ignore.errors || []);
  }
  if (config.offline) require('offline-plugin/runtime').install();
  if (
    config.options.verbose ||
    config.options.debug ||
    config.level === 'trace'
  ) {
    setLevel('trace');
  } else if (config.env === 'development') {
    setLevel('debug');
  } else {
    setLevel(config.level);
  }
  if (config !== 'production') window.reactant = { config };
  if (module.hot)
    module.hot.accept(
      '~/../web/ClientApp',
      renderClient.bind(this, initialProps)
    );
  renderClient(initialProps).catch(log.error);
  return { config, initialProps };
}
