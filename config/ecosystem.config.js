const dotenv = require('dotenv')
const fs = require("fs");

const readConfig = (path) => dotenv.parse(fs.readFileSync(path));

const serviceList = [
    {
        name: "server-service",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./services/server-service/build/index.mjs",
        env: readConfig("./.env"),
    },
    {
        name: "client-service",
        exec_mode: "fork",
        instances: "1",
        autorestart: true,
        max_restarts: "5",
        cron_restart: '0 0 * * *',
        max_memory_restart: '1250M',
        script: "./services/client-service/build/index.mjs",
        env: readConfig("./.env"),
    },
];

module.exports = {
    apps: [
        ...serviceList,
    ],
};
