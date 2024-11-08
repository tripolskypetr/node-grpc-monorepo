import TYPES from "./config/types";
import "./config/provide";
import { inject, init } from "./core/di";
import type LoggerService from "./services/base/LoggerService";

const baseServices = {
    loggerService: inject<LoggerService>(TYPES.loggerService),
};

init();

export const lib = {
    ...baseServices,
};
