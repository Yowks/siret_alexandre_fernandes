# Siret Invader

`Siret Invader` is a tool to process big CSV file into MongoDB with multiple processes for best performance.

## Installation and Usage

When download of the project, just use :

```bash
npm i
```

You must first run : 
```bash
node index.js
```

Then you can enter the manager :

```bash
node manager.js
```

You have to download the siret file [StockEtablissement_utf8.csv](http://files.data.gouv.fr/insee-sirene/StockEtablissement_utf8.zip) and put it in the upload directory of this project.

Then, before the process into MongoDB database split it in multiple files with the option `4` of the manager

The manager allows 4 actions by 4 numbers : 

* 1 - Start the files process
* 2 - Pause the process
* 3 - Resume the process
* 4 - Split the big file

**Note**: `(Ctrl/Cmd)+C to quit` 

## Third-Party Used 

* [pm2](https://github.com/Unitech/pm2) for process management
* [chalk](https://github.com/chalk/chalk) for colored logs into the console
* [figlet](https://github.com/patorjk/figlet-cli) for funny title manager
* [mongodb](https://github.com/mongodb/mongo) for NoSQL storage
* [split](https://github.com/dominictarr/split) for treat a file line by line.
* [ESlint](https://github.com/eslint/eslint) and [AirBnB style guide](https://github.com/airbnb/javascript) for linting.

## Configuration

You can configure the app as you wish in the `process.json` file.

To use the maximum number of cores of your computer for the process, you can change here : 
```json
{
    ...,
    "instances": "max"
}
```

The `cropSize` property is equivalent to the amount of lines given to MongoDB for insertion.

