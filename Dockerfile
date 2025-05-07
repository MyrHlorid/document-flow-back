FROM node:18-alpine AS production
WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist

COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

COPY package*.json ./

# Открываем порт, на котором работает приложение (по умолчанию NestJS использует 3000)
EXPOSE 8080

# Команда для запуска приложения
# Убедитесь, что 'main.js' это ваш главный файл после сборки
CMD ["node", "dist/main.js"]
