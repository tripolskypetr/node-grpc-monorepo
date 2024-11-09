import { globSync } from "glob";
import { basename } from "path";

import { sync as rimraf } from "rimraf";

import touch from "touch";
import fs from "fs";

const createCopy = (prefix = "modules") => {
    for (const modulePath of globSync(`./${prefix}/*`, { onlyDirectories: true })) {
        const moduleName = basename(modulePath);
        fs.mkdirSync(`./build/${prefix}/${moduleName}/build`, { recursive: true });
        for (const filePath of  globSync(`./${prefix}/${moduleName}/build/*`)) {
            const fileName = basename(filePath);
            fs.copyFileSync(`./${prefix}/${moduleName}/build/${fileName}`, `./build/${prefix}/${moduleName}/build/${fileName}`);
        }
    }
}

rimraf("build");
fs.mkdirSync("build");
touch("./build/.gitkeep");

createCopy("modules")
createCopy("services")
createCopy("apps")