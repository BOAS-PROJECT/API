module.exports = {
  apps: [
    {
      name: "boas-api",
      script: "app.js",
      instances: "2", // Utilise tous les cœurs disponibles
      exec_mode: "cluster", // Mode cluster pour utiliser plusieurs instances
      watch: '.',
      ignore_watch: ['node_modules', 'public'],
    },
  ],
  deploy: {
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
  },
};
