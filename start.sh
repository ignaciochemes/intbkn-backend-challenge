#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting Backend Challenge Setup...${NC}"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "${RED}Error: Docker is not installed.${NC}" >&2
  exit 1
fi

if ! [ -x "$(command -v docker compose)" ]; then
  echo -e "${RED}Error: Docker Compose is not installed.${NC}" >&2
  exit 1
fi

echo -e "${YELLOW}Starting PostgreSQL container...${NC}"
docker compose up -d

echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
sleep 10

if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  npm install
fi

if [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Creating .env.local file...${NC}"
  cp .env.example .env.local
fi

if [ ! -f ".env.dev" ]; then
  echo -e "${YELLOW}Creating .env.dev file...${NC}"
  cp .env.example .env.dev
fi

if [ ! -f ".env" ]; then
  echo -e "${YELLOW}Creating .env file...${NC}"
  cp .env.example .env
fi

sed -i 's/DATABASE_HOST=localhost/DATABASE_HOST=localhost/g' .env.local
sed -i 's/DATABASE_USER=backend-challenge/DATABASE_USER=bchallenge/g' .env.local
sed -i 's/DATABASE_PASS=backend-challenge/DATABASE_PASS=bchallenge/g' .env.local
sed -i 's/DATABASE_NAME=postgres/DATABASE_NAME=bchallenge/g' .env.local

echo -e "${YELLOW}Building the application...${NC}"
npm run build

echo -e "${YELLOW}Copying seed data...${NC}"
npm run copy-seed-data

echo -e "${GREEN}Starting the application in local mode...${NC}"
echo -e "${GREEN}The API will be available at: http://localhost:33000/api/v1/backend-challenge${NC}"
echo -e "${GREEN}Swagger documentation: http://localhost:33000/api${NC}"
npm run start:local