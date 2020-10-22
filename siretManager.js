
const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const readline = require('readline');
const pm2 = require('pm2');
const fs = require('fs');

clear();
console.log(
  chalk.red(
    figlet.textSync('Siret-Invader'),
  ),
);
console.log(chalk.yellow('Enter 1 to start processing files'));
console.log(chalk.yellow('Enter 2 to pause all processes'));
console.log(chalk.yellow('Enter 3 to resume all processes'));
console.log(chalk.yellow('Enter 4 to split csv'));
console.log('\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const cliPm = () => {
  if (fs.existsSync('process.lock')) {
    rl.question('> ', (answer) => {
      pm2.connect((errConnect) => {
        if (errConnect) {
          console.log(errConnect);
          process.exit(2);
        } else {
          pm2.start({
            name: 'plink', exec_mode: 'fork', script: 'processLinker.js', args: [answer, '--no-autorestart'],
          }, (errStart) => {
            if (errStart) {
              console.log("Couldn't do any action", errStart);
            } else {
              setTimeout(() => {
                pm2.delete('plink');
                console.log(`\n${chalk.yellow('Action accomplished')}\n`);
                cliPm();
              }, 1500);
            }
          });
        }
      });
    });
  } else {
    console.log(chalk.red('Main entry process seems to be not running. You have to run `node entry.js` before using Siret Manager. Bye ;)'));
    process.exit(0);
  }
};

cliPm();

process.on('SIGINT', () => {
  process.exit(0);
});
