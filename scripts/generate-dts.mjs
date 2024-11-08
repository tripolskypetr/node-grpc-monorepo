import { globSync } from "glob";
import { basename } from "path";
import { writeFileSync } from "fs";

import prettierSync from "@prettier/sync";

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

for (const protoPath of globSync("./proto/*.proto")) {
    
    const output = [];

    const namespaceName = basename(protoPath)
        .replace(".proto", "");

    const packageDefinition = protoLoader.loadSync(protoPath);
    const proto = grpc.loadPackageDefinition(packageDefinition);

    const services = Object.entries(proto)
        .filter(([, value]) => value.service)
        .map(([key, value]) => [key, Object.keys(value.service)]);

    {
        output.push("declare namespace GRPC {");
    }

    services.forEach(([className, methodList]) => {
        output.push(`interface I${className} {`);
        methodList.forEach((methodName) => {
            output.push(`${methodName}(...args: any): any;`);
        });
        output.push("}");
    });

    {
        output.push("}");
    }

    const typedef = prettierSync.format(output.join("\n"), {
        semi: true,
        endOfLine: "auto",
        trailingComma: "all",
        singleQuote: false,
        printWidth: 80,
        tabWidth: 2,
        parser: 'typescript',
    });

    writeFileSync(`./modules/remote-grpc/src/types/${namespaceName}.d.ts`, typedef);
}
