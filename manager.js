const chalk = require('chalk');
const figlet = require('figlet');
const clear = require('clear');
const readline = require('readline');
const pm2 = require('pm2');
const fs = require('fs');

clear();
console.log(
  chalk.redBright(
    figlet.textSync('Siret Invader'),
  ),
);
console.log(chalk.yellowBright('Enter 1 to start processing files'));
console.log(chalk.yellowBright('Enter 2 to pause'));
console.log(chalk.yellowBright('Enter 3 to resume'));
console.log(chalk.yellowBright('Enter 4 to split csv'));
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
            name: 'process_link', exec_mode: 'fork', script: './app/controllers/process_message.js', args: [answer, '--no-autorestart'],
          }, (errStart) => {
            if (errStart) {
              console.log('Error', errStart);
            } else {
              setTimeout(() => {
                pm2.delete('process_link');
                console.log(`\n${chalk.yellowBright('Done')}\n`);
                cliPm();
              }, 1500);
            }
          });
        }
      });
    });
  } else {
    console.log(chalk.red("Launch 'node.js index.js' before the manager."));
    process.exit(0);
  }
};

cliPm();

process.on('SIGINT', () => {
  process.exit(0);
});
