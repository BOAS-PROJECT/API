module.exports = {
    apps : [{
      name: 'BOAS-API',
      script: 'app.js',
      instances: 4,
      watch: '.',
      ignore_watch: ['node_modules', 'public'],
    }],
    deploy : {
      production : {
        user : 'root',
        host : '180.149.196.12',
        ref  : 'origin/main',
        repo : 'https://github.com/BOAS-PROJECT/API.git',
        path : '/root/API/BOAS-API',
        'pre-deploy-local': '',
        'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
        'pre-setup': ''
      }
    }
  };
    