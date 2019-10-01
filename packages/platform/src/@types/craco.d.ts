declare module '@craco/craco' {
  import { TransformOptions as BabelOptions } from '@babel/core';
  import {
    Rule as WebpackRule,
    Loader as WebpackLoader,
    Configuration as WebpackConfig
  } from 'webpack';

  export interface JestConfig {
    [key: string]: any;
  }
  export interface EslintOptions {
    [key: string]: any;
  }
  export interface TypeScriptOptions {
    [key: string]: any;
  }
  export interface CracoConfig {
    babel?: BabelOptions;
    eslint?: EslintOptions;
    typescript?: TypeScriptOptions;
    webpack?: WebpackConfig;
  }
  export interface ConfigError {
    message: string;
    githubRepo: string;
    githubIssueQuery: string;
  }
  export interface Modes {
    extends: string;
    file: string;
  }
  export type Matcher = (f: any) => any;
  export function loaderByName(
    targetLoaderName: string
  ): (rule: WebpackRule) => any;
  export function getLoader(
    webpackConfig: WebpackConfig,
    matcher: Matcher
  ): {
    isFound: boolean;
    match: WebpackLoader;
  };
  export function getLoaders(
    webpackConfig: WebpackConfig,
    matcher: Matcher
  ): {
    hasFoundAny: boolean;
    matches: WebpackLoader[];
  };
  export function removeLoaders(
    webpackConfig: WebpackConfig,
    matcher: Matcher
  ): {
    hasRemovedAny: boolean;
    removedCount: number;
  };
  export function addBeforeLoader(
    webpackConfig: WebpackConfig,
    matcher: Matcher,
    newLoader: WebpackLoader
  ): {
    isAdded: boolean;
  };
  export function addAfterLoader(
    webpackConfig: WebpackConfig,
    matcher: Matcher,
    newLoader: WebpackLoader
  ): {
    isAdded: boolean;
  };
  export function addBeforeLoaders(
    webpackConfig: WebpackConfig,
    matcher: Matcher,
    newLoader: WebpackLoader
  ): {
    isAdded: boolean;
    addedCount: number;
  };
  export function addAfterLoaders(
    webpackConfig: WebpackConfig,
    matcher: Matcher,
    newLoader: WebpackLoader
  ): {
    isAdded: boolean;
    addedCount: number;
  };
  export function when<Value = any>(
    condition: boolean,
    fct: () => Value,
    unmet: Value
  ): Value;
  export function whenDev<Value = any>(fct: () => Value, unmet: Value): Value;
  export function whenProd<Value = any>(fct: () => Value, unmet: Value): Value;
  export function whenTest<Value = any>(fct: () => Value, unmet: Value): Value;
  export function throwUnexpectedConfigError(configError: ConfigError): void;
  export function gitHubIssueUrl(repo: string, query: string): string;
  export function createJestConfig(
    cracoConfig: CracoConfig,
    context?: object
  ): JestConfig;
  export function createWebpackDevConfig(
    cracoConfig: CracoConfig,
    context?: object
  ): WebpackConfig;
  export function createWebpackProdConfig(
    cracoConfig: CracoConfig,
    context?: object
  ): WebpackConfig;
  export type ESLINT_MODES = Modes;
  export type POSTCSS_MODES = Modes;
}
