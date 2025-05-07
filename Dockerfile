# ---- Стадия сборки ----
FROM node:18-alpine AS builder
# Используйте более конкретную версию Node.js, если это необходимо, например node:18.17.0-alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./
# Если вы используете yarn, раскомментируйте следующую строку и закомментируйте npm ci
# COPY yarn.lock ./

# Устанавливаем зависимости
RUN npm ci --only=production
# Если вы используете yarn:
# RUN yarn install --frozen-lockfile --production

# Копируем остальные файлы проекта
COPY . .

# Собираем приложение
RUN npm run build

# ---- Стадия установки производственных зависимостей (опционально, если devDependencies большие) ----
# Эта стадия помогает уменьшить размер финального образа, если у вас много devDependencies,
# которые не нужны для запуска приложения в production, но нужны для сборки.
# Если у вас нет такой проблемы, можно пропустить эту стадию и устанавливать все зависимости в 'builder'
# а затем копировать node_modules из 'builder' в 'production'
FROM node:18-alpine AS prod-deps
WORKDIR /usr/src/app
COPY package*.json ./
# Если вы используете yarn:
# COPY yarn.lock ./
RUN npm ci --omit=dev
# Если вы используете yarn:
# RUN yarn install --frozen-lockfile --production

# ---- Финальная стадия (Production) ----
FROM node:18-alpine AS production
# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Устанавливаем часовой пояс (опционально, но полезно для логов)
# ENV TZ=Europe/Moscow
# RUN apk add --no-cache tzdata

# Копируем собранное приложение из стадии 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Копируем node_modules из стадии 'prod-deps' (или 'builder' если пропустили 'prod-deps')
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules
# Если вы не использовали стадию prod-deps, то копируйте из builder:
# COPY --from=builder /usr/src/app/node_modules ./node_modules

# Копируем package.json (может быть нужен для некоторых библиотек или для запуска скриптов)
COPY package*.json ./

# Открываем порт, на котором работает приложение (по умолчанию NestJS использует 3000)
EXPOSE 3000

# Команда для запуска приложения
# Убедитесь, что 'main.js' это ваш главный файл после сборки
CMD ["node", "dist/main.js"]
