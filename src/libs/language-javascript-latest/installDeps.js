import execa from 'execa';
import { oneLine } from 'common-tags';

import os from 'os';
const IS_WINDOWS = os.platform() === 'win32';

import { debug } from '../../logger';

export default function install ({ skipChmod, rootDir }) {
  if (IS_WINDOWS) {
    // see issue #142 and #143
    // Windows user will be required to download approx ~1.3GB of Docker images
    // also, when run on GNU/Linux, permissions on the .dawson-dist will be too restrictive
    // and only root can access
    const dockerCmd = oneLine`
      docker run
        -v ${rootDir}/.dawson-dist:/dawson-dist
        dawsonorg/install-deps:javascript-latest
    `;
    debug('[windows-compat] installindg deps using docker:', dockerCmd);
    return execa.shell(dockerCmd);
  }
  // if you modify the build commands below, be sure to update the Docker image too
  debug('installing deps using system\'s npm');
  return execa.shell(
    oneLine`
      cd .dawson-dist &&
      NODE_ENV=production npm install --production babel-cli babel-polyfill babel-preset-env
               babel-plugin-transform-object-rest-spread &&
      NODE_ENV=production npm install --production
      ${skipChmod ? '' : '&& chmod -Rf a+rX .'}`
  );
}