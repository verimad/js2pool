import * as fs from 'fs';
import * as commander from 'commander';
import * as kinq from 'kinq';

require('../nodejs/AsyncSocket');

kinq.enable();

type PackageInfo = {
    version: string,
};

let packageInfo = JSON.parse(fs.readFileSync('../../package.json').toString('utf8')) as PackageInfo;

let cmd = <any>commander.version(packageInfo.version)
    .option('-c, --config', 'Configruation File Path')
    .parse(process.argv);

if (!cmd.config) {
    console.error('--config, no configuration file');
    process.exit(1);
}

if (!fs.existsSync(cmd.config)) {
    console.error('configuration file not found');
    process.exit(-1);
}

export default {
    config: cmd.config,  // configuration file path
}