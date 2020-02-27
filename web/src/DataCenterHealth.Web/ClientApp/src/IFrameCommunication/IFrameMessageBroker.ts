import { IDictionaryStringTo, IIFrameMessage, IIFrameMessagingBroker, IPromiseMessage } from "./Types";


export class IFrameMessagingBroker implements IIFrameMessagingBroker {
    // tslint:disable-next-line:no-any
    private promiseMessageCallbacks: ((message: IIFrameMessage) => void)[] = [];
    private promiseCallbackIndex: number = 0;

    private messageHandlers: IDictionaryStringTo<Function[]> = {};

    // tslint:disable-next-line:no-parameter-properties
    public constructor(private validateMessageEvent?: (message: MessageEvent) => boolean) {

    }
    public async sendMessageWithPromise<T>(toWindow: Window, message: IIFrameMessage, targetOrigin: string = "*"): Promise<T> {
        const promiseMessage = this.constructPromiseMessage(message);
        const promiseIndex = promiseMessage.metadata.promiseIndex;

        this.sendMessage(toWindow, promiseMessage, targetOrigin);

        return new Promise<T>((resolve: (value?: T | PromiseLike<T> | undefined) => void, reject: (value?: T | PromiseLike<T> | undefined) => void) => {
            this.promiseMessageCallbacks[promiseIndex] = (promiseResponseMessage: IPromiseMessage) => {
                if (promiseResponseMessage.error) {
                    reject(Promise.reject(Error(promiseResponseMessage.error)));
                } else {
                    resolve(promiseResponseMessage.message);
                }
            };
        });
    }

    public sendMessage(toWindow: Window, message: IIFrameMessage, targetOrigin: string = "*") {
        this.sendPostMessage(toWindow, message, targetOrigin);
    }

    public processReceivedMessage(messageEvent: MessageEvent) {
        if (!this.validateMessageEvent || this.validateMessageEvent(messageEvent)) {
            const frameMessage = <IIFrameMessage>(messageEvent.data);
            this.invokeMessageHandlers(frameMessage);
            if (frameMessage.resolvePromise) {
                this.invokePromiseResponse(<IPromiseMessage>frameMessage);
            }
        }
    }

    // tslint:disable-next-line:no-any
    public registerMessageHandlers(messageType: string, messageHandler: (message: any) => void) {
        if (!this.messageHandlers[messageType]) {
            this.messageHandlers[messageType] = [];
        }
        this.messageHandlers[messageType].push(messageHandler);
    }

    private sendPostMessage(toWindow: Window, message: IIFrameMessage, targetOrigin: string = "*") {
        toWindow.postMessage(message, targetOrigin);
    }

    private invokeMessageHandlers(message: IIFrameMessage) {
        if (this.messageHandlers[message.messageType]) {
            // tslint:disable-next-line:no-any
            this.messageHandlers[message.messageType].forEach((callback: any) => callback(message));
        }
    }

    private invokePromiseResponse(message: IPromiseMessage) {
        const promiseMessage = message;
        if (promiseMessage.metadata && (promiseMessage.metadata.promiseIndex !== undefined)) {
            const promiseIndex = promiseMessage.metadata.promiseIndex;
            const promiseCallback = this.promiseMessageCallbacks[promiseIndex];
            if (promiseCallback) {
                promiseCallback(message);
            }
        }

    }

    private getNextPromiseCallbackIndex() {
        return this.promiseCallbackIndex++;
    }

    private constructPromiseMessage(message: IIFrameMessage): IPromiseMessage {
        const promiseMessage = <IPromiseMessage>message;
        promiseMessage.metadata = { promiseIndex: this.getNextPromiseCallbackIndex() };

        return promiseMessage;
    }
}

export module IFrameMessagingBrokerFactory {
    let broker: IIFrameMessagingBroker;

    export function getIFrameMessagingBroker(): IIFrameMessagingBroker {
        if (!broker) {
            broker = new IFrameMessagingBroker();
        }

        return broker;
    }
}
