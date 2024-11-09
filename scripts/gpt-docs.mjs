import { globSync } from "glob";
import { basename, join, extname } from "path";

import { createCompletion, loadModel } from "gpt4all";

import fs from "fs";

const GPT_PROMPT =
  "Please write a summary for that Typescript API Reference with several sentences in more human way";

const model = await loadModel("Nous-Hermes-2-Mistral-7B-DPO.Q4_0.gguf");

const generateDescription = async (filePath) => {
    const data = fs.readFileSync(filePath).toString();
    const chat = await model.createChatSession({
        temperature: 0.8,
        systemPrompt: `### System:\n${GPT_PROMPT}.\n\n`,
    });
    const result = await createCompletion(chat, data);
    return result.choices[0].message.content;
}

// Modules
{
    for (const modulePath of globSync("./modules/*", { onlyDirectories: true })) {
        const moduleName = basename(modulePath);
        const classList = globSync(`./modules/${moduleName}/docs/classes/*`);
        const outputPath = join(process.cwd(), 'docs', `${moduleName}.md`);
        const output = [];
        output.push(`# ${moduleName}`);
        output.push("");
        if (!classList.length) {
            output.push("Нет данных");
        }
        for (const classPath of classList) {
            const className = basename(classPath, extname(classPath));
            output.push(`## ${className}`);
            output.push("");
            output.push(await generateDescription(classPath))
            output.push("");
        }
        fs.writeFileSync(outputPath, output.join("\n"));
    }
}

// Services
{
    for (const modulePath of globSync("./services/*", { onlyDirectories: true })) {
        const moduleName = basename(modulePath);
        const classList = globSync(`./services/${moduleName}/docs/classes/*`);
        const outputPath = join(process.cwd(), 'docs', `${moduleName}.md`);
        const output = [];
        output.push(`# ${moduleName}`);
        output.push("");
        if (!classList.length) {
            output.push("Нет данных");
        }
        for (const classPath of classList) {
            const className = basename(classPath, extname(classPath));
            output.push(`## ${className}`);
            output.push("");
            output.push(await generateDescription(classPath))
            output.push("");
        }
        fs.writeFileSync(outputPath, output.join("\n"));
    }
}
