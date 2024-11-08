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
