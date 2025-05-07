# ---- Стадия установки зависимостей для сборки (Builder Dependencies) ----
FROM node:18-alpine AS deps
# Используйте более конкретную версию Node.js, если это необходимо, например node:18.17.0-alpine
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json (или yarn.lock)
COPY package*.json ./
# Если вы используете yarn, раскомментируйте следующую строку и закомментируйте npm ci
# COPY yarn.lock ./

# Устанавливаем ВСЕ зависимости (включая devDependencies, необходимые для сборки)
RUN npm ci
# Если вы используете yarn:
# RUN yarn install --frozen-lockfile

# ---- Стадия сборки (Builder) ----
FROM node:18-alpine AS builder
WORKDIR /usr/src/app

# Копируем все зависимости (включая devDependencies) из предыдущей стадии
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Копируем исходный код
COPY . .

# Собираем приложение
# Убедитесь, что у вас есть скрипт "build" в package.json (обычно "nest build")
RUN npm run build
# RUN npx nest build # Альтернативный вариант, если нет скрипта

# ---- Стадия установки производственных зависимостей (Production Dependencies) ----
# Эта стадия нужна, чтобы в финальном образе были только производственные зависимости.
FROM node:18-alpine AS prod-deps
WORKDIR /usr/src/app

COPY package*.json ./
# Если вы используете yarn:
# COPY yarn.lock ./

# Устанавливаем ТОЛЬКО производственные зависимости
RUN npm ci --omit=dev
# Если вы используете yarn:
# RUN yarn install --frozen-lockfile --production

# ---- Финальная стадия (Production) ----
FROM node:18-alpine AS production
# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Устанавливаем переменную окружения PORT. Railway может предоставлять свой порт.
# NestJS по умолчанию использует 3000. Если Railway предоставляет PORT, приложение должно его слушать.
ENV NODE_ENV=production
# ENV PORT=3000 # Вы можете установить порт по умолчанию здесь, если Railway его не переопределит

# Копируем собранное приложение из стадии 'builder'
COPY --from=builder /usr/src/app/dist ./dist

# Копируем node_modules (только производственные) из стадии 'prod-deps'
COPY --from=prod-deps /usr/src/app/node_modules ./node_modules

# Копируем package.json (может быть нужен для некоторых библиотек или для запуска скриптов)
COPY package*.json ./

# Railway автоматически определяет порт из EXPOSE или переменной PORT.
# EXPOSE ${PORT:-3000} # Можно использовать переменную окружения PORT или значение по умолчанию
EXPOSE 3000 # Или просто укажите порт, на котором ваше приложение слушает по умолчанию

# Команда для запуска приложения
# Убедитесь, что 'main.js' это ваш главный файл после сборки
CMD ["node", "dist/main.js"]
