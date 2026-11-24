#!/usr/bin/env node
/* Runs next dev. Node rather than shell so the port and the local-Quill flag can be set on
   Windows too, where npm scripts run under cmd.exe and cannot use env-var prefixes. */

const { execSync } = require('child_process');

const env = { ...process.env };

// Set by the monorepo's start:website so the site loads Quill from the local webpack dev server
// (see env.js) instead of the CDN. Running this workspace on its own keeps using the CDN.
if (process.argv.includes('--local-quill')) env.NEXT_PUBLIC_LOCAL_QUILL = 'true';

// Comes from the monorepo's package.json "config.ports.website"; Next's default applies if unset.
const port = process.env.npm_package_config_ports_website;

execSync(`next dev${port ? ` --port ${port}` : ''}`, { stdio: 'inherit', env });
