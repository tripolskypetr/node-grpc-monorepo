# 🔥 node-grpc-monorepo

> The TypeScript-gRPC monorepo starter kit that simplifies microservices development using OOP principles. Features type-safe gRPC communication, PM2 process management, unified database operations, easy debugging without Docker, and automated SOLID code analysis with AI-powered documentation.

![meme](./meme.png)

## Microservice Architecture That's Clear to OOP Developers

Large applications are written in Domain Driven Design. A special case of this architecture is Model View Controller in a monolith. This is taught in universities, and finding talent is simple. However, to handle high loads, you need microservices. Finding good talent who can maintain OOP code in microservices, rather than procedural code, is difficult.

To solve the problem of procedural code in microservices, a starter kit for a scalable NodeJS microservice in a monorepo was developed.

## Why not tRPC

1. **Need to maintain the ability to write services in Golang** 

In the future, there should be an option to rewrite high-load code segments in a compiled language like `golang`, which tRPC doesn't allow

2. **Router as an anti-pattern in microservice architecture**

Using the router pattern to navigate microservice calls will result in forking the git repo to create microservice groups where the code of some services will be copy-pasted. 

3. **Useless yum validations**

Similar to `prop-types` in React, the preferred way to declare a contract is through `interface` of arguments, cause declaratively described static type checking at compile time is significantly easier to port to another programming language

4. **Partial restart of backend application**

The gRPC way is decentralized. Cause there is no single entry poit using It will avoid bottleneck in performance. For example, If the main tRPC server is down you have to restart all microservices. In gRPC, the host application and all services could be restated separately. Also you can use [YAML Engineer](https://www.envoyproxy.io/) to declare strategy of proxying requests such as [retry policy](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/http/http_routing.html#arch-overview-http-routing-retry)

5. **The class method mapping instead of remote procedures**

When you working with tRPC, you will use switch-case in remote procedure to map the class method by using table function with action type. This is unnecessary boilerplate, easier to provide class instance for method mapping and keep the mapping automatic

## Problems Solved

1. **Working with gRPC through TypeScript**

As of 2016, there was no separation between `commonjs` and `esm` modules and TypeScript, so proto files were suggested to be converted into questionable js content. In this starter kit, the architecture implies access through an [sdk object](https://github.com/lonestone/nest-sdk-generator) with `IntelliSense` support, the problem of generating `d.ts` from `proto` is solved by a js script without a native binary. Any interaction between microservices is done through calling an interface method of the target class and wrapper class.

2. **Running backend without docker via `npm start`**

Sometimes, you need access to js files without isolation to inspect them with a debugger or add `console.log` to an already transpiled bundle. [PM2](https://pm2.keymetrics.io/) is used to run microservices.

3. **Single Source of Responsibility for Database Operations**

For database operations, it's better to use the onion architecture Model View Presenter, where the presentation layer organizes mapping and logging of data interactions, and the database services layer provides abstraction from the DBMS. The scalability problem of this pattern is solved by moving the code to a common module; simplified, each microservice can host a copy of the monolith.

4. **Executing Microservice Methods without Postman**

Host applications that interact with services via gRPC are located in the `apps` folder. Two applications were created: `apps/host-main` and `apps/host-test`, the first with a web server, in the second you can write arbitrary code and run it with the `npm run test` command. Also, in `apps/host-test` you can write unit tests if you need to do test-driven development.

5. **Automatic Detection of non-SOLID Code Using Language Models**

If an unreliable employee writes code that doesn't follow SOLID principles, a neural network can objectively assess the class's area of responsibility. In this starter kit, when transpiling a service, types are exported to `types.d.ts` files, which are used to analyze the purpose of each class in the library or microservice and automatically document it in a human-readable form, a couple of paragraphs of text per class.

## Simplifying Microservice Interaction

**1. Boilerplate code to make gRPC work is cumbersome. Creating gRPC client and server is moved to common code, application code launches the microservice in one line**

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

There's a `proto` file describing `FooService` with an `Execute` method that receives an object with a `data` string as one argument.

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

The `*.proto` files are converted to `*.d.ts` by the `scripts/generate-dts.mjs` script (generates the `GRPC` namespace), then a wrapper is written to specify types on the TypeScript side.

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

Then, the gRPC server shares class methods in one line. Methods return `Promise`, we can use `await` and throw exceptions, in addition to `@grpc/grpc-js`, no need to work with [callback hell](https://en.wiktionary.org/wiki/callback_hell).

```tsx
import { grpc } from "@modules/remote-grpc";

import test from "tape";

test('Except fooClientService will return output', async (t) => {
  const output = await grpc.fooClientService.Execute({ data: "bar" });
  t.strictEqual(output.data, "ok");
})
```

**2. Database interaction (MVC) is moved to common code and is available from the host application, services, and other libraries**

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

[Appwrite](https://appwrite.io) application server is used, a wrapper over MariaDB that provides immediate access to request metrics calculation, disk space accounting, OAuth 2.0 authorization, backups, and [websocket event bus](https://appwrite.io/docs/apis/realtime).

## Simplifying Development

A critical problem of microservice architecture is integration (IDE - **Integrated** development environment): it's difficult for programmers to inject a debugger, typically newcomers debug through `console.log`. This is especially noticeable if the code initially only works in docker.

In addition to the main host application `apps/host-main` (REST API web server), an entry point `apps/host-test` is made for test-driven development. It doesn't use the test runtime, in other words, we can directly call a microservice handle or database controller method without postman in `public static void main()`. A shortcut `npm run test` is already added, which compiles and runs the application. Also, you can go to any service or host folder and run `npm run start:debug`.

## Simplifying Deployment

Using [Lerna](https://lerna.js.org/), project compilation and launch is done in one command through `npm start` (parallel build). Want to rebuild, run the command again. Want to run newly written code - run `npm start && npm run test`. The environment for running the project will be installed automatically after `npm install` thanks to the `postinstall` script.

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

For automatic restart of microservices and hosts on error, the [PM2](https://pm2.keymetrics.io/) process manager is used. It provides [crontab](https://crontab.guru/) out of the box, which is convenient as it doesn't need to be configured from the OS side.

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

## Simplifying Logging

As you can see in [ProtoService](modules/remote-grpc/src/services/base/ProtoService.ts), all gRPC calls are logged, including arguments and execution results or errors.

```log
{"level":30,"time":1731179018964,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.964Z","createdBy":"remote-grpc.log","args":["remote-grpc fooClientService Execute",{"args":[{"data":"foo"}]}]}
{"level":30,"time":1731179018965,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.965Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeClient calling service=FooService method=Execute requestId=rbfl7l",{"request":{"data":"foo"}}]}
{"level":30,"time":1731179018984,"pid":18336,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.984Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeClient succeed service=FooService method=Execute requestId=rbfl7l",{"request":{"data":"foo"},"result":{"data":"ok"}}]}
{"level":30,"time":1731179018977,"pid":22292,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.977Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeServer executing method service=FooService method=Execute requestId=7x63h",{"request":{"data":"foo"}}]}
{"level":30,"time":1731179018978,"pid":22292,"hostname":"DESKTOP-UDO3RQB","logLevel":"log","createdAt":"2024-11-09T19:03:38.978Z","createdBy":"remote-grpc.log","args":["remote-grpc protoService makeServer method succeed requestId=7x63h",{"request":{"data":"foo"},"result":{"data":"ok"}}]}
```

Logs are written with rotation. When the `debug.log` file reaches the 100Mb limit, it will be compressed into `20241003-1132-01-debug.log.gz`. Additionally, you can write your own logs using [pinolog](https://www.npmjs.com/package/pinolog).

## Simplifying Documentation

Development involves using [functional programming](https://en.wikipedia.org/wiki/MapReduce) in `host` applications and object-oriented programming following [SOLID](https://en.wikipedia.org/wiki/SOLID) principles in services and common code. As a result:

1. **Code is in classes**
2. **There is dependency injection**

The `rollup.config.mjs` files create [types.d.ts](modules/remote-grpc/types.d.ts), containing class declarations. From these, [API Reference](https://github.com/react-declarative/react-declarative/blob/master/docs/auto/interfaces/IQuery.md) is generated in markdown format. Then, the markdown files are processed by the [Nous-Hermes-2-Mistral-7B-DPO](./scripts/gpt-docs.mjs) neural network, which returns the result in human-readable form.

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

Automatic documentation generation through [CI/CD](https://en.wikipedia.org/wiki/CI/CD). ~~Change the prompt and see if the class corresponds to SOLID~~

## How to Start Development

Set up the environment

```bash
cp .env.example .env
npm install
npm start
```

Open the file [modules/remote-grpc/src/config/params.ts](modules/remote-grpc/src/config/params.ts). Add a microservice, deciding which port it will occupy.

```tsx
export const CC_GRPC_MAP = {
    "FooService": {
        grpcHost: "localhost:50051",
        protoName: "foo_service",
        methodList: [
            "Execute",
        ],
    },
    // Add here
...
```

Then, following the Dependency Injection pattern, add the service type in [modules/remote-grpc/src/config/types.ts](modules/remote-grpc/src/config/types.ts), the service instance in [modules/remote-grpc/src/config/provide.ts](modules/remote-grpc/src/config/provide.ts), and the injection in [modules/remote-grpc/src/services/client](modules/remote-grpc/src/services/client).

```tsx
const clientServices = {
    fooClientService: inject<FooClientService>(TYPES.fooClientService),
    barClientService: inject<BarClientService>(TYPES.barClientService),
    bazClientService: inject<BazClientService>(TYPES.bazClientService),
    // Add here
};

init();

export const grpc = {
    ...baseServices,
    ...clientServices,
};
```

Next, copy the [services/foo-service](services/foo-service) folder and use it as a base to implement your logic. Database interactions should be moved to [modules/remote-db](modules/remote-db) following the same principle. Don't forget about logging in LoggerService - each `view` layer method should log the service name, method name, and arguments.

## Thank you for your attention!
