# Utiliser une image Node.js officielle
FROM node:18-alpine

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Copier les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances
RUN npm install

# Installer PM2 globalement
RUN npm install pm2 -g

# Copier tout le code sauf les fichiers exclus dans .dockerignore
COPY . .

# Exposer le port défini dans .env (ici, 4880)
EXPOSE 4880

# Lancer l'application avec PM2
CMD ["pm2-runtime", "ecosystem.config.js"]