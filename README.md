## @e22m4u/js-repository-mongodb-adapter

MongoDB адаптер для [@e22m4u/js-repository](https://www.npmjs.com/package/@e22m4u/js-repository)  

## Установка


```bash
npm install @e22m4u/js-repository-mongodb-adapter
```

*требует пакет [js-repository](https://www.npmjs.com/package/@e22m4u/js-repository)*

## Параметры

Все указанные параметры опциональны:

| название | значение по умолчанию |
|----------|-----------------------|
| protocol | `'mongodb'`           |
| host     | `'127.0.0.1'`         |
| port     | `27017`               |
| database | `'database'`          |
| username | `undefined`           |
| password | `undefined`           |

Пример:

```js
import {Schema} from '@e22m4u/js-repository';

const schema = new Schema();

// объявление источника
schema.defineDatasource({
  name: 'myMongo', // название источника
  adapter: 'mongodb', // имя адаптера
  // параметры
  host: '127.0.0.1',
  port: 27017,
  database: 'myDatabase',
});

// объявление модели
schema.defineModel({
  name: 'user', // название модели
  datasource: 'myMongo', // используемый источник
  properties: { // поля модели
    name: 'string',
    surname: 'string',
  },
});

// получаем репозиторий по названию модели и создаем запись
const userRep = schema.getRepository('user');
const user = await userRep.create({name: 'John', surname: 'Doe'});

console.log(user);
// {
//   id: '64f3454e5e0893c13f9bf47e',
//   name: 'John',
//   surname: 'Doe',
// }
```

## Тесты

Запуск контейнера `mongo:latest` скриптом `setup.sh`

```bash
./setup.sh
```

Выполнение тестов

```bash
npm run test
```

## Лицензия

MIT
