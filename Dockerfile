FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app

# Copier uniquement les fichiers nécessaires pour installer les dépendances
COPY package.json package-lock.json ./

# Installer les dépendances sans déplacer node_modules
RUN npm install --production --silent 

# Copier le reste des fichiers de l'application
COPY . .

EXPOSE 5001

# Changer le propriétaire des fichiers pour l'utilisateur 'node'
RUN chown -R node:node /usr/src/app

# Passer à l'utilisateur non-root
USER node

# Commande pour démarrer l'application
CMD ["npm", "start"]
