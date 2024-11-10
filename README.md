# 🔥 node-grpc-monorepo

> Lerna monorepo ready for microservice development

## Понятная ООП-шнику микросервисная архитектура

Крупные приложения пишутся в Domain Driven Design. Частным случаем этой архитектуры является Model View Controller в монолите. Этому учат в университетах, найти кадр просто. Однако, чтобы проект держал нагрузку, нужен микросервис. Найти хороший кадр, который сможет поддерживать ООП код в микросервисе, а не процедурный, сложно.

Чтобы разрешить проблему процедурного кода в микросервисе, был разработан starter kit масштабируемого NodeJS микросервиса в монорепозитории

## Решаемые проблемы

1. **Работа с gRPC через TypeScript**

На момент 2016 года не было разделения `commonjs` и `esm` модулей и Typescript, поэтому файлы proto предлагали конвертировать в js сомнительного содержания. В этом starter kit архитектура подразумевает доступ через [sdk object](https://github.com/lonestone/nest-sdk-generator) с поддержкой `IntelliSense`, проблема генерации `d.ts` из `proto` решена скриптом на js без нативного бинарника

2. **Запуск backend без docker через `npm start`**

Иногда, нужно получить доступ к js файлам без изоляции, чтобы просмотреть работу отладчиком или добавить в уже транспилированный бандл `console.log`. Для запуска микросервисов используется [PM2](https://pm2.keymetrics.io/)

3. **Единый источник ответственности для работы с базой данных**

Для работы с базой данных лучше использовать луковичную архитектуру Model View Presenter, где слой представления организует маппинг и логгирование взаимодействия c данными, слой сервисов базы данных осуществляет абстракцию от СУБД. Проблема масштабируемости этого паттерна решена вынесением кода в общий модуль, упрощенно, каждый микросервис может разместить в себе копию монолита.

4. **Выполнение методов микросервисов без Postman**

Хост приложения, осуществляющие взаимодействие с сервисами по gRPC лежат в папке `apps`. Было создано два приложения: `apps/host-main` и `apps/host-test`, первое с веб сервером, во втором можно написать произвольный код и запустить его командой `npm run test`. Так же, в `apps/host-test` можно писать юнит тесты, если нужно вести разработку тестированием

5. **Автоматическое выявление не SOLID кода с использованием языковых моделей**

Если недобросовестный сотрудник пишет код не по SOLID, объективно оценить область ответственности класса может нейронка. В этом starter kit, при транспиляции сервиса, типы экспортируются в файлы `types.d.ts`, которые используются для анализа назначения каждого класса библиотеки или микросервиса и автоматической документации в понятном человеку виде, пару абзацев текста на класс

## Упрощаем взаимодействие микросервисов

**1. Boilerplate код, чтобы gRPC заработал, громоздок. Создание клиента и сервера gRPC вынесено в общий код, прикладной код запускает микросервис в одну строку**

```proto
syntax = "proto3";

message FooRequest {
    string data = 1;
}

message FooResponse {
    string data = 1;
}

service FooService {
  rpc Execute (FooRequest) returns (FooResponse);
}

```

Есть `proto` файл, описывающий `FooService` с методом `Execute`, получающий одним аргументом объект со строкой `data`


```tsx
export class FooClientService implements GRPC.IFooService {

    private readonly protoService = inject<ProtoService>(TYPES.protoService);
    private readonly loggerService = inject<LoggerService>(TYPES.loggerService);

    private _fooClient: GRPC.IFooService = null as never;

    Execute = async (...args: any) => {
        this.loggerService.log("remote-grpc fooClientService Execute", { args });
        return await this._fooClient.Execute(...args);
    };

    protected init = () => {
        this._fooClient = this.protoService.makeClient<GRPC.IFooService>("FooService")
    }

}
```

Файлы `*.proto` преобразуются в `*.d.ts` скриптом `scripts/generate-dts.mjs` (генерирует простратство имен `GRPC`), далее пишется обертка, чтобы уточнить типы на стороне Typescript.

```tsx
import { grpc } from "@modules/remote-grpc";

export class FooService {
    Execute = (request: any) => {
        if (request.data !== "foo") {
            throw new Error("data !== foo")
        }
        return { data: "ok" }
    }
}

grpc.protoService.makeServer("FooService", new FooService);
```

Далее, сервер gRPC шарит методы класса в одну строчку. Методы возвращают `Promise`, можем делать `await` и бросать исключения, в дополнении к `@grpc/grpc-js`, не нужно работать с [callback hell](https://en.wiktionary.org/wiki/callback_hell).


```tsx
import { grpc } from "@modules/remote-grpc";

import test from "tape";

test('Except fooClientService will return output', async (t) => {
  const output = await grpc.fooClientService.Execute({ data: "bar" });
  t.strictEqual(output.data, "ok");
})

```

**2. Взаимодействие с базой данных (MVC), вынесен в общий код и доступно из приложения хоста, из сервисов и других библиотек**

```tsx
export class TodoDbService {

    private readonly appwriteService = inject<AppwriteService>(TYPES.appwriteService);

    findAll = async () => {
        return await resolveDocuments<ITodoRow>(listDocuments(CC_APPWRITE_TODO_COLLECTION_ID));
    };

    findById = async (id: string) => {
        return await this.appwriteService.databases.getDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
        );
    };

    create = async (dto: ITodoDto) => {
        return await this.appwriteService.databases.createDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            this.appwriteService.createId(),
            dto,
        );
    };

    update = async (id: string, dto: Partial<ITodoDto>) => {
        return await this.appwriteService.databases.updateDocument<ITodoDocument>(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
            dto,
        );
    };

    remove = async (id: string) => {
        return await this.appwriteService.databases.deleteDocument(
            CC_APPWRITE_DATABASE_ID,
            CC_APPWRITE_TODO_COLLECTION_ID,
            id,
        );
    };

};

...

import { db } from "@modules/remote-db";
await db.todoViewService.create({ title: "Hello world!" });
console.log(await db.todoRequestService.getTodoCount());
```

Используется сервер приложений [Appwrite](https://appwrite.io), обертка над MariaDB, позволяющая с ходу получить высчитывание метрик запросов, учет места на жестком диске, авторизацию OAuth 2.0, бекапы и [шину событий websocket](https://appwrite.io/docs/apis/realtime)

## Упрощаем разработку

Критической проблемой микросервисной архитектуры является интегрируемость (IDE - **Integrated** development environment): программисту сложно вклиниться отладчиком, как правило, новички осуществляют debug через `console.log`. Особенно это заметно, если код изначально работает только в docker.

Помимо основного хост приложения `apps/host-main` (REST API веб сервер), сделана точка входа `apps/host-test` для разработки тестированием. Она не использует test runtime, другими словами, можем прямо в `public static void main()` дернуть ручку микросервиса или метод контроллер базы данных без postman. Сразу добавлен шорткат `npm run test`, который комилирует и запускает приложение. Так же, можно перейти в папку любого сервиса или хоста и запустить `npm run start:debug`

## Упрощаем деплой

Используя [Lerna](https://lerna.js.org/), компиляция и запуск проекта осуществляется в одну команду через `npm start` (параллельная сборка). Хотим пересобрать, запускаем команду ещё раз. Хотим запустить новый дописанный код - запускаем `npm start && npm run test`. Окружение для запуска проекта установится автоматически после `npm install` благодаря скрипту `postinstall`

```json
{
    "name": "node-grpc-monorepo",
    "private": true,
    "scripts": {
        "test": "cd apps/host-test && npm start",
        "start": "npm run pm2:stop && npm run build && npm run pm2:start",
        "pm2:start": "pm2 start ./config/ecosystem.config.js",
        "pm2:stop": "pm2 kill",
        "build": "npm run build:modules && npm run build:services && npm run build:apps && npm run build:copy",
        "build:modules": "dotenv -e .env -- lerna run build --scope=@modules/*",
        "build:apps": "dotenv -e .env -- lerna run build --scope=@apps/*",
        "build:services": "dotenv -e .env -- lerna run build --scope=@services/*",
        "build:copy": "node ./scripts/copy-build.mjs",
        "docs": "sh ./scripts/linux/docs.sh",
        "docs:win": ".\\scripts\\win\\docs.bat",
        "docs:gpt": "node ./scripts/gpt-docs.mjs",
        "postinstall": "npm run postinstall:lerna && npm run postinstall:pm2",
        "postinstall:lerna": "npm list -g lerna || npm install -g lerna",
        "postinstall:pm2": "npm list -g pm2 || npm install -g pm2",
        "proto:dts": "node ./scripts/generate-dts.mjs",
        "proto:path": "node ./scripts/get-proto-path.mjs",
        "translit:rus": "node ./scripts/rus-translit.cjs"
    },
```

Для автоматического перезапуска микросервисов и хостов при ошибке, используется менеджер процессов [PM2](https://pm2.keymetrics.io/). Из коробки предоставляет [crontab](https://crontab.guru/), что удобно, так как не нужно настраивать со стороны операционки.

```js
const dotenv = require('dotenv')
const fs = require("fs");

const readConfig = (path) => dotenv.parse(fs.readFileSync(path));

const appList = [
    {
        name: "host-main",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./apps/host-main/build/index.mjs",
        env: readConfig("./.env"),
    },
];

const serviceList = [
    {
        name: "baz-service",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./services/baz-service/build/index.mjs",
        env: readConfig("./.env"),
    },
    {
        name: "bar-service",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./services/bar-service/build/index.mjs",
        env: readConfig("./.env"),
    },
    {
        name: "foo-service",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./services/foo-service/build/index.mjs",
        env: readConfig("./.env"),
    },
];

module.exports = {
    apps: [
        ...appList,
        ...serviceList,
    ],
};

```

## Упрощаем логирование

Как можно заметить в [ProtoService](modules/remote-grpc/src/services/base/ProtoService.ts), все вызовы gRPC пишутся в лог, в том числе с аргументами и результатом выполнения или ошибкой.

```log
{"level":30,"time":1731179018964,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.964Z","createdBy":"remote-grpc.log","args":["remote-grpc fooClientService Execute",{"args":[{"data":"foo"}]}]}
{"level":30,"time":1731179018965,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.965Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeClient calling service=FooService method=Execute requestId=rbfl7l",{"request":{"data":"foo"}}]}
{"level":30,"time":1731179018984,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.984Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeClient succeed service=FooService method=Execute requestId=rbfl7l",{"request":{"data":"foo"},"result":{"data":"ok"}}]}
{"level":30,"time":1731179018977,"pid":22292,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.977Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeServer executing method service=FooService method=Execute requestId=7x63h",{"request":{"data":"foo"}}]}
{"level":30,"time":1731179018978,"pid":22292,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.978Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeServer method succeed requestId=7x63h",{"request":{"data":"foo"},"result":{"data":"ok"}}]}
```

Логи пишутся с ротацией. Когда файл `debug.log` достигнет лимита 100Mb, он будет сжат в `20241003-1132-01-debug.log.gz`. Дополнительно, можете писать свои логи, используя [pinolog](https://www.npmjs.com/package/pinolog)

## Упрощаем документирование

Разработка предполагает использование [функционального программирования](https://en.wikipedia.org/wiki/MapReduce) в `host` приложениях и объектно ориентированного по [SOLID](https://en.wikipedia.org/wiki/SOLID) в сервисах и общем коде. Как следствие

1. **Код на классах**
2. **Есть инъекция зависимостей**

Файлы `rollup.config.mjs` создают [types.d.ts](modules/remote-grpc/types.d.ts), содержащие объявления классов. Из них генерируется [API Reference](https://github.com/react-declarative/react-declarative/blob/master/docs/auto/interfaces/IQuery.md) в формате markdown. Далее, файлы markdown попадают в нейронку [Nous-Hermes-2-Mistral-7B-DPO](./scripts/gpt-docs.mjs), которая возвращает результат в читаемом человеком виде

```md
# remote-grpc

## ProtoService

ProtoService is a TypeScript class that serves as an interface for managing gRPC services. It has a constructor, properties such as loggerService and _protoMap, and methods like loadProto, makeClient, and makeServer. The loggerService property is used for logging, while _protoMap stores the protobuf definitions. The loadProto method loads a specific protobuf definition based on the provided name. The makeClient method creates a client for the specified gRPC service, while makeServer creates a server for the specified gRPC service using a connector. The available services are "FooService", "BarService", and "BazService".

## LoggerService

The LoggerService is a TypeScript class that provides logging functionality. It has a constructor which initializes the `_logger` property, and two methods: `log()` and `setPrefix()`. 

The `_logger` property is a variable that stores the logger instance, which will be used for logging messages. The `log()` method is used to log messages with optional arguments. The `setPrefix()` method is used to set a prefix for the log messages.

## FooClientService

The `FooClientService` is a TypeScript class that implements the `GRPC.IFooService` interface, which means it provides methods to interact with a gRPC service. The class has three properties: `protoService`, `loggerService`, and `_fooClient`. 

The constructor of `FooClientService` does not take any arguments.

The `protoService` property is of type `any`, and it seems to hold the protobuf service definition.
The `loggerService` property is of type `any`, and it appears to be a logger service for logging messages.
The `_fooClient` property is of type `any`, and it seems to be a client for communicating with the gRPC service.

The `Execute` method is a generic function that takes any number of arguments and returns a Promise. It is used to execute the gRPC service methods.
The `init` method is a void function that initializes the `_fooClient` property.

Overall, `FooClientService` is a class that provides methods to interact with a gRPC service, using the protobuf service definition and a logger for logging messages. It initializes the gRPC client and provides a generic `Execute` method to execute the gRPC service methods.

```

Да, верно, автоматическая генерация документации через [CI/CD](https://en.wikipedia.org/wiki/CI/CD). ~~Меняем промпт и видим, соответствует ли класс SOLID~~

## С чего начать разработку

Настройте окружение

```bash
cp .env.example .env
npm install
npm start
```

Откройте файл [modules/remote-grpc/src/config/params.ts](modules/remote-grpc/src/config/params.ts). Добавьте микросервис, придумав, какой порт он будет занимать. 

```tsx
export const CC_GRPC_MAP = {
    "FooService": {
        grpcHost: "localhost:50051",
        protoName: "foo_service",
        methodList: [
            "Execute",
        ],
    },
    // Сюда
...

```

Далее следуя паттерну Dependency injection добавьте тип сервиса в [modules/remote-grpc/src/config/types.ts](modules/remote-grpc/src/config/types.ts), инстанс сервиса в [modules/remote-grpc/src/config/provide.ts](modules/remote-grpc/src/config/provide.ts), и инъекцию в [modules/remote-grpc/src/services/client](modules/remote-grpc/src/services/client).

```tsx
const clientServices = {
    fooClientService: inject<FooClientService>(TYPES.fooClientService),
    barClientService: inject<BarClientService>(TYPES.barClientService),
    bazClientService: inject<BazClientService>(TYPES.bazClientService),
    // Сюда
};

init();

export const grpc = {
    ...baseServices,
    ...clientServices,
};

```

Далее, скопируйте папку [services/foo-service](services/foo-service) и на её основе пропишите логику. Взаимодействие с базой нужно вынести в [modules/remote-db](modules/remote-db) по этому же принципу. Не забывайте про логирование в LoggerService, каждый метод `view` слоя должен записать в лог имя сервиса, имя метода и аргументы

## Спасибо за внимание!
