import { IFrameMessagingBrokerFactory } from "./IFrameCommunication/IFrameMessageBroker";

export module UIInitializer {

    export function initialize() {
        initializeIFrame();
    }

    function initializeIFrame() {
        window.addEventListener("message", handleIFrameMessage, false);
    }

    function handleIFrameMessage(messageEvent: MessageEvent): void {
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().processReceivedMessage(messageEvent);
    }
}
