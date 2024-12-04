import { grpc } from "@modules/remote-grpc";
import { sleep } from 'functools-kit';

function getSecondsSinceMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(0, 0, 0, 0);
    const secondsSinceMidnight = Math.floor((+now - +midnight) / 1000);
    return secondsSinceMidnight;
}

const send = grpc.streamService.makeServer<{ side: string, value: string }>("MessageService", async (message) => {
    console.log(`${message.data.side} ${message.data.value}`)
    await sleep(250);
});

setInterval(() => {
    send({
        clientId: "",
        requestId: "",
        serviceName: "",
        userId: "",
        data: {
            side: "server",
            value: getSecondsSinceMidnight(),
        }
    })
}, 1_000);

grpc.loggerService.setPrefix("msg-server-service");
