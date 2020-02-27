export interface IIFrameMessagingBroker {
    sendMessageWithPromise<T>(toWindow: Window, message: IIFrameMessage, targetOrigin?: string): Promise<T>;
    sendMessage(toWindow: Window, message: IIFrameMessage, targetOrigin?: string): void;
    processReceivedMessage(message: MessageEvent): void;
    // tslint:disable-next-line:no-any
    registerMessageHandlers(messageType: string, messageHandler: (message: IIFrameMessage) => void): void;
}

export interface IIFrameMessage {
    messageType: string;
    // tslint:disable-next-line:no-any
    message?: any;
    resolvePromise?: boolean;
    error?: string;
}
export interface IPromiseMessage extends IIFrameMessage {
    metadata: { promiseIndex: number };
}

export interface IDictionaryStringTo<T> {
    [key: string]: T;
}
