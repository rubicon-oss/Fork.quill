/*eslint-env node*/

const { BannerPlugin, DefinePlugin } = require('webpack');
const common = require('./webpack.common.cjs');
const { merge } = require('webpack-merge');
require('webpack-dev-server');
const { readFileSync } = require('fs');
const { join, resolve } = require('path');

const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf8'));

const bannerPack = new BannerPlugin({
  banner: [
    `Quill Editor v${pkg.version}`,
    pkg.homepage,
    `Copyright (c) 2017-${new Date().getFullYear()}, Slab`,
    'Copyright (c) 2014, Jason Chen',
    'Copyright (c) 2013, salesforce.com',
  ].join('\n'),
  entryOnly: true,
});
const constantPack = new DefinePlugin({
  QUILL_VERSION: JSON.stringify(pkg.version),
});

module.exports = (env) =>
  merge(common, {
    mode: env.production ? 'production' : 'development',
    devtool: 'inline-source-map',
    plugins: [bannerPack, constantPack],
    devServer: {
      // Set here rather than in the start script so it works in shells without bash syntax.
      ...(process.env.npm_package_config_ports_webpack && {
        port: Number(process.env.npm_package_config_ports_webpack),
      }),
      static: {
        directory: resolve(__dirname, './dist'),
      },
      hot: false,
      allowedHosts: 'all',
      devMiddleware: {
        stats: 'minimal',
      },
    },
    stats: 'minimal',
  });
