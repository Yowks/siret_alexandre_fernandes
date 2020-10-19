module.exports = {
    worker : {
      name                  : 'sirets-invader',
      watch                 : false,
      script                : './scripts/workers.js',
      instances             : 4,
      exec_mode             : 'cluster',
      max_memory_restart    : '1G'
    },
    
    path : {
      import_file           : './data/dataset.csv',
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
}