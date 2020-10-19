# :space_invader: siretsinvaders :space_invader:
 
 Sirets Invaders 

# Requirements

Prerequisites: [Node.js](https://nodejs.org/en/) (>=8.x), yarn or npm.

You have to download the siret file [StockEtablissement_utf8.csv](http://files.data.gouv.fr/insee-sirene/StockEtablissement_utf8.zip) and put it in the data directory of this project.

# Installation
Use `git clone` to install this app.

```
git clone https://github.com/Yowks/siret_alexandre_fernandes
npm install
```

# Configuration

There is two configuration :

- `./.env` file
The `.env` file contains the acces to the database and the table.

- `./config.js` file
To change file name to split, modifiy the line `import_file`.
Also if you want to limit the number of cores working on the project you can change the `core`line into the number you want or if you want to have the max perfomance replace by `"max"`.

For instance, you may want to use the maximum number of cores of your computer for the processing, simply put 
```json
{
    ...,
    "instances": "max"
}
```

The `bulk_limit` property is equivalent to the amount of lines of the file processed given to MongoDB for insertion.
* For better performance but more memory usage, use higher value (10000 is a good exemple)
* For lower memory usage but less performance, use lower value (1000 is a good exemple)

```json
worker : {
    name                  : 'sirets-invader',
    watch                 : false,
    script                : './scripts/workers-pse.js',
    instances             : "max",
    exec_mode             : 'cluster',
    max_memory_restart    : '1G'
},

path : {
    import_file           : './data/sirets.csv',
    history_file          : './data/sirets/history.json',
    import_output_dir     : './data/sirets/',
    logs_dir              : './logs/',
    logs_dir         : './logs/',
},

split : {
    lineLimit             : 280000
},

workers : {
    core                : "max",
    bulk_limit          : 50000
},

delay : {
    between_workers     : 2000,
    between_check_end   : 2000
}
```

# Start
```
# Import and split files
npm run split

# Launch workers with pm2
npm run start
```
