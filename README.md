# :space_invader: siretsinvaders :space_invader:
 
 Sirets Invaders 

# Requirements

Prerequisites: [Node.js](https://nodejs.org/en/) (>=8.x), yarn or npm.

You have to download the siret file [StockEtablissement_utf8.csv](http://files.data.gouv.fr/insee-sirene/StockEtablissement_utf8.zip) and put it in the root directory of this project.

# Installation
Use `git clone` to install this app.

```
git clone https://github.com/Yowks/siret_alexandre_fernandes
npm install
```

# Configuration

There is two configuration :

- `./.process.json` file
The `.process.json` file contains the acces to the database and the table and pm2 config.

You can setup the database connection in the *dbHost*, *dbPort* and *dbName*.
Modify instances will put the max cores use by pm2.


```json
{
  "apps" : [{
    "name": "siret-invader",
    "script": "app.js",
    "instances": 4,
    "exec_mode": "cluster",
    "error_file": "process-logs/pm2-error.log",
    "out_file": "process-logs/pm2.log",
    "dbHost": "localhost",
    "dbPort": "27017",
    "dbName": "siret-invader",
    "csvDirOutput": "csv",
    "cropSize": 10000
  }]
}
```


# Start

Server needs to be launch before the manager.

```
# Launch the server
npm run server

# Launch manager to do the actions
npm run manager
```
