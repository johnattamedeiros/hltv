#!/bin/bash

# Interromper o script em caso de erro
set -e

# Atualizar o repositório
echo "Atualizando o repositório com git pull..."
git pull

# Parar o contêiner, se estiver em execução
echo "Parando o contêiner existente..."
docker stop hltv || true

# Remover o contêiner
echo "Removendo o contêiner existente..."
docker rm hltv || true

# Remover a imagem
echo "Removendo a imagem existente..."
docker rmi hltv || true

# Construir a nova imagem
echo "Construindo a nova imagem..."
docker build -t hltv .

# Rodar o contêiner
echo "Iniciando o novo contêiner..."
docker run -d --name hltv -p 3003:3003 hltv

echo "Container 'hltv' iniciado e disponível na porta 3003."
