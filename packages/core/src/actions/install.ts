import execa from 'execa';
import fs from 'fs-extra';
import path from 'path';
import { Context, ActionResult, Options, PluginAction } from '@reactant/types';
import { bootstrap } from '@reactant/context/node';
import { loadConfig } from '@reactant/config/node';
import { merge } from '@reactant/context';
import { where } from '@reactant/helpers';
import Logger from '../logger';
import runActions from '.';
import { preBootstrap, postBootstrap, postProcess } from '../hooks';

export interface Dependancies {
  [key: string]: string;
}

export interface Pkg {
  dependancies?: Dependancies;
  devDependancies?: Dependancies;
  name: string;
  peerDependancies?: Dependancies;
}

export default async function install(
  platformName?: string,
  options?: Options,
  pluginActions: PluginAction[] = []
): Promise<ActionResult> {
  const context = bootstrap(
    loadConfig(),
    platformName,
    'install',
    options,
    preBootstrap,
    postBootstrap
  );
  const logger = new Logger(context.logLevel);
  await runActions(context, logger, pluginActions);
  const pkgPath = path.resolve(context.paths.root, 'package.json');
  if (
    !(await fs.pathExists(path.resolve(context.paths.root, 'node_modules')))
  ) {
    const pkg = await fs.readJson(pkgPath);
    pkg.dependancies = Object.entries(
      (pkg?.dependancies || {}) as Dependancies
    ).reduce(
      (dependancies: Dependancies, [version, dependancy]: [string, string]) => {
        if (dependancy.substr(0, 10) === '@reactant/') {
          dependancies[dependancy] = version;
        }
        return dependancies;
      },
      {}
    );
    pkg.devDependancies = Object.entries(
      (pkg?.devDependancies || {}) as Dependancies
    ).reduce(
      (dependancies: Dependancies, [version, dependancy]: [string, string]) => {
        if (dependancy.substr(0, 10) === '@reactant/') {
          dependancies[dependancy] = version;
        }
        return dependancies;
      },
      {}
    );
    pkg.peerDependencies = {};
    await installDependancies(pkg, context, logger);
  }
  let pkg = await fs.readJson(pkgPath);
  if (!platformName) {
    await Promise.all(
      context.platformNames.map(async (platformName: string) => {
        const platformPkgPath = path.resolve(
          context.paths.root,
          platformName,
          'package.json'
        );
        if (await fs.pathExists(platformPkgPath)) {
          pkg = merge(pkg, await fs.readJson(platformPkgPath));
        }
      })
    );
  } else {
    const platformPkgPath = path.resolve(
      context.paths.root,
      context.platformName,
      'package.json'
    );
    if (await fs.pathExists(platformPkgPath)) {
      const platformPkg = await fs.readJson(platformPkgPath);
      pkg.dependancies = merge(
        pkg.dependencies || {},
        platformPkg.dependencies || {}
      );
      pkg.devDependencies = merge(
        pkg.devDependencies || {},
        platformPkg.devDependencies || {}
      );
      pkg.peerDependencies = merge(
        pkg.peerDependencies || {},
        platformPkg.peerDependencies || {}
      );
    }
  }
  await installDependancies(pkg, context, logger);
  postProcess(context, logger);
  return null;
}

export async function installDependancies(
  pkg: Pkg,
  context: Context,
  logger: Logger
) {
  let command =
    (await where(context.config?.preferredPackageManager || '')) || '';
  if (!command?.length) command = (await where('pnpm')) || '';
  if (!command?.length) command = (await where('yarn')) || '';
  if (!command?.length) command = (await where('npm')) || '';
  if (!command?.length) {
    throw new Error("please install 'pnpm', 'yarn' or 'npm'");
  }
  const pkgPath = path.resolve(context.paths.root, 'package.json');
  const pkgBackupPath = path.resolve(
    context.paths.root,
    'package.json.reactant_backup'
  );

  await fs.rename(pkgPath, pkgBackupPath);
  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  await execa(command, ['install'], {
    stdio: 'inherit',
    cwd: context.paths.root
  });
  if (context.debug) logger.debug(pkg);
  await fs.remove(pkgPath);
  await fs.rename(pkgBackupPath, pkgPath);
}
