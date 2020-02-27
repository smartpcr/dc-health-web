import { IFrameMessagingBrokerFactory } from "../IFrameCommunication/IFrameMessageBroker";
import { IIFrameMessage, IPromiseMessage } from "../IFrameCommunication/Types";
import { AuthContextFactory } from "./AuthContextFactory";
import { IFrameLoader } from "./IFrameLoader";
import { IFrameMessageTypes } from "./IFrameMessageTypes";
import { IAuthContextConfig, IAuthenticationContext } from "./Interfaces";

export module AuthIFrameRequestHandler {
    let authContextConfig: IAuthContextConfig;

    export function registerRequestHandlers() {
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().registerMessageHandlers(IFrameMessageTypes.REQUEST_AAD_TOKEN, acquireTokenAndSendMessage);
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().registerMessageHandlers(IFrameMessageTypes.INIT_AUTH_CONTEXT, handleAuthContextInit);
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().registerMessageHandlers(IFrameMessageTypes.REQUEST_CURRENT_USER, getCurrentUser);
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().registerMessageHandlers(IFrameMessageTypes.TRY_HANDLE_WINDOW_CALLBACK, tryHandleWindowCallback);
        IFrameMessagingBrokerFactory.getIFrameMessagingBroker().registerMessageHandlers(IFrameMessageTypes.IS_TOKEN_RENEWAL_IN_PROGRESS, isTokenRenewalInProgress);
    }

    function handleAuthContextInit(requestPayload: IIFrameMessage) {
        if (validateAuthContextRequestPayload(requestPayload.message, requestPayload)) {
            authContextConfig = requestPayload.message;
        }
    }

    async function acquireTokenAndSendMessage(requestPayload: IIFrameMessage) {
        if (validateAuthContextRequestPayload(authContextConfig, requestPayload)) {
            const toWindow = IFrameLoader.getIFrameWindow();
            const broker = IFrameMessagingBrokerFactory.getIFrameMessagingBroker();
            if (!validateTokenRequestPayload(requestPayload.message)) {
                broker.sendMessage(toWindow, constructTokenResponseMessage(requestPayload, undefined, "Invalid AAD resource id."));
            } else {
                try {
                    const authContext = getAuthContext();

                    const token = await authContext.acquireToken(requestPayload.message.resourceId);
                    broker.sendMessage(toWindow, constructTokenResponseMessage(requestPayload, token));
                } catch (error) {
                    if (error !== "User login is required") {
                        broker.sendMessage(toWindow, constructTokenResponseMessage(requestPayload, undefined, error));
                    }
                }
            }
        }
    }

    async function getCurrentUser(requestPayload: IIFrameMessage) {
        if (validateAuthContextRequestPayload(authContextConfig, requestPayload)) {
            const toWindow = IFrameLoader.getIFrameWindow();
            const broker = IFrameMessagingBrokerFactory.getIFrameMessagingBroker();
            try {
                const authContext = getAuthContext();

                const user = await authContext.getCurrentUser();
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.RESPONSE_CURRENT_USER, user, undefined, true));
            } catch (error) {
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.RESPONSE_CURRENT_USER, undefined, error, true));
            }
        }
    }

    async function tryHandleWindowCallback(requestPayload: IIFrameMessage) {
        if (validateAuthContextRequestPayload(authContextConfig, requestPayload)) {
            const toWindow = IFrameLoader.getIFrameWindow();
            const broker = IFrameMessagingBrokerFactory.getIFrameMessagingBroker();
            try {
                const authContext = getAuthContext();

                const handled = await authContext.tryHandleWindowCallBack();
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.TRY_HANDLE_WINDOW_CALLBACK, handled, undefined, true));
            } catch (error) {
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.TRY_HANDLE_WINDOW_CALLBACK, undefined, error, true));
            }
        }
    }

    async function isTokenRenewalInProgress(requestPayload: IIFrameMessage) {
        if (validateAuthContextRequestPayload(authContextConfig, requestPayload)) {
            const toWindow = IFrameLoader.getIFrameWindow();
            const broker = IFrameMessagingBrokerFactory.getIFrameMessagingBroker();
            try {
                const authContext = getAuthContext();

                const inProgress = await authContext.isTokenRenewalInProgress();
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.IS_TOKEN_RENEWAL_IN_PROGRESS, inProgress, undefined, true));
            } catch (error) {
                broker.sendMessage(toWindow, constructIFrameMessage(requestPayload, IFrameMessageTypes.IS_TOKEN_RENEWAL_IN_PROGRESS, undefined, error, true));
            }
        }
    }

    function constructTokenResponseMessage(receivedRequestPayload: IIFrameMessage, token?: string, error?: string): IPromiseMessage {
        const promiseMessage = <IPromiseMessage>receivedRequestPayload;

        return {
            messageType: IFrameMessageTypes.RESPONSE_AAD_TOKEN,
            message: token,
            resolvePromise: true,
            error: error,
            metadata: promiseMessage.metadata
        };
    }

    // tslint:disable-next-line:no-any
    function constructIFrameMessage(receivedRequestPayload: IIFrameMessage, messageType: string, message?: any, error?: string, resolvePromise?: boolean): IPromiseMessage {
        return {
            messageType,
            message,
            resolvePromise,
            error,
            metadata: (<IPromiseMessage>receivedRequestPayload).metadata
        };
    }

    function validateTokenRequestPayload(payload: ITokenRequestPayload): boolean {
        if (!payload || !payload.resourceId) {
            return false;
        }

        return true;
    }

    function validateAuthContextRequestPayload(payload: IAuthContextConfig, requestPayload: IIFrameMessage): boolean {
        if (!payload || !payload.clientId || !payload.redirectUri) {
            const toWindow = IFrameLoader.getIFrameWindow();
            IFrameMessagingBrokerFactory.getIFrameMessagingBroker().sendMessage(toWindow, constructTokenResponseMessage(requestPayload, undefined, "AAD authentication context not initialized."));

            return false;
        }

        return true;
    }

    function getAuthContext(): IAuthenticationContext {
        return AuthContextFactory.getAuthContext(authContextConfig, false);
    }
}


export interface ITokenRequestPayload {
    resourceId: string;
}
