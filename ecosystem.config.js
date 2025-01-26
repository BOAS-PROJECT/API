module.exports = {
  apps: [
    {
      name: "boas-api",
      script: "./app.js",
      instances: "max", // Utilise tous les cœurs disponibles
      exec_mode: "cluster", // Mode cluster pour utiliser plusieurs instances
      env: {
        NODE_ENV: "production",
        PORT: 4880,
      },
      env_production: {
        NODE_ENV: "production",
      },
      log_file: "./logs/combined.log", // Fichier combiné pour tous les logs
      error_file: "./logs/error.log", // Fichier de logs pour les erreurs
      out_file: "./logs/out.log", // Fichier de logs standard
      time: true, // Ajouter un timestamp aux logs
    },
  ],
};
