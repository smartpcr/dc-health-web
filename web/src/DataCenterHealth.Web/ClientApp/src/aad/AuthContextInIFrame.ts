import { IFrameMessagingBrokerFactory } from "../IFrameCommunication/IFrameMessageBroker";
import { IIFrameMessage, IIFrameMessagingBroker } from "../IFrameCommunication/Types";
import { IFrameMessageTypes } from "./IFrameMessageTypes";
import { IAuthContextConfig, IAuthenticationContext, IUser } from "./Interfaces";

export class AuthenticationContextInIFrame implements IAuthenticationContext {
    private iframeMessagingBroker: IIFrameMessagingBroker = IFrameMessagingBrokerFactory.getIFrameMessagingBroker();
    constructor(config: IAuthContextConfig) {
        this.iframeMessagingBroker.sendMessage(window.parent, { messageType: IFrameMessageTypes.INIT_AUTH_CONTEXT, message: config });
    }

    public async acquireToken(resourceId: string): Promise<string> {
        const tokenRequestMessage = this.constructTokenRequestMessage(resourceId);

        return this.iframeMessagingBroker.sendMessageWithPromise<string>(window.parent, tokenRequestMessage);
    }

    public async getCurrentUser(): Promise<IUser> {
        return this.iframeMessagingBroker.sendMessageWithPromise<IUser>(window.parent, { messageType: IFrameMessageTypes.REQUEST_CURRENT_USER });
    }

    public async tryHandleWindowCallBack(): Promise<boolean> {
        return this.iframeMessagingBroker.sendMessageWithPromise<boolean>(window.parent, { messageType: IFrameMessageTypes.TRY_HANDLE_WINDOW_CALLBACK });

    }

    public async isTokenRenewalInProgress(): Promise<boolean> {
        return this.iframeMessagingBroker.sendMessageWithPromise<boolean>(window.parent, { messageType: IFrameMessageTypes.IS_TOKEN_RENEWAL_IN_PROGRESS });

    }

    private constructTokenRequestMessage(resourceId: string): IIFrameMessage {

        return {
            message: { resourceId },
            messageType: IFrameMessageTypes.REQUEST_AAD_TOKEN
        };
    }
}

