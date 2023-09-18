## @e22m4u/node-repository-mongodb-adapter

MongoDB адаптер для [@e22m4u/node-repository](https://www.npmjs.com/package/@e22m4u/node-repository)  

## Установка


```bash
npm install @e22m4u/node-repository-mongodb-adapter
```

*требует пакет [node-repository](https://www.npmjs.com/package/@e22m4u/node-repository)*

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
import {Schema} from '@e22m4u/node-repository';

const schema = new Schema();

// объявление источника
schema.defineDatasource({
  name: 'myMongo', // название источника
  adapter: 'mongodb', // имя адаптера
  // параметры
  host: '192.128.0.2',
  port: 27017,
})

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

Запуск контейнера `mongodb_c` скриптом `setup.sh`

```bash
./setup.sh
```

Выполнение тестов

```bash
npm run test
```

## Лицензия

MIT
