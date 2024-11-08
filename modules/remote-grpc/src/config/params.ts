export const CC_GRPC_MAP = {
    "FooService": {
        grpcHost: "localhost:50051",
        protoName: "foo_service",
        methodList: [
            "Execute",
        ],
    },
    "BarService": {
        grpcHost: "localhost:50052",
        protoName: "bar_service",
        methodList: [
            "Execute",
        ],
    },
    "BazService": {
        grpcHost: "localhost:50053",
        protoName: "baz_service",
        methodList: [
            "Execute",
        ],
    },
} as const;

export const CC_GRPT_PROTO_PATH = process.env.CC_GRPT_PROTO_PATH || "./proto";
