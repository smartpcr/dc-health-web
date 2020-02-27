import { IAuthContextConfig, IAuthenticationContext, IUser } from "./Interfaces";
import * as AuthenticationContext from "./adal";

export class AdAuthenticationContext implements IAuthenticationContext {
    private authContext: AuthenticationContext;

    constructor(config: IAuthContextConfig) {
        this.authContext = new AuthenticationContext({
            clientId: config.clientId,
            redirectUri: config.redirectUri,
            postLogoutRedirectUri: config.postLogoutRedirectUri,
            popUp: config.popUp,
            cacheLocation: config.cacheLocation,
            loadFrameTimeout: config.loadFrameTimeout,
            state: config.state
        });
    }

    public async acquireToken(resourceId: string): Promise<string> {
        try {
            const handledWindowCallback = await this.tryHandleWindowCallBack();
            if (handledWindowCallback) {
                const error = this.authContext.getLoginError();
                if (error) {
                    return Promise.reject(error);
                }
            }
        } catch (error) {
            return Promise.reject(error);
        }

        return new Promise<string>((resolve, reject) => {
            this.authContext.acquireToken(
                resourceId, (error, token) => {
                    if (error || !token) {
                        if (error === "User login is required") {
                            this.authContext.login();
                        }

                        reject(error || "No token found");

                        return;
                    }
                    resolve(token);
                }
            );
        });
    }

    public async getCurrentUser(): Promise<IUser> {
        return Promise.resolve(this.authContext.getCachedUser());
    }

    public async tryHandleWindowCallBack(): Promise<boolean> {
        const isCallback = this.authContext.isCallback(window.location.hash);
        if (isCallback) {
            this.authContext.handleWindowCallback();

            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }

    public async isTokenRenewalInProgress(): Promise<boolean> {
        if (window.parent !== window) {
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }
}
