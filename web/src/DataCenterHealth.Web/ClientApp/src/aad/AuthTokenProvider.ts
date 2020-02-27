import { AuthContextFactory } from "./AuthContextFactory";
import { IAuthContextConfig, IAuthenticationContext, IUser } from "./Interfaces";
import { Config } from "~/config";
import { VssNavigation } from "~/navigation";
import { ProductCatalogUIContext } from "~/ProductCatalogUIContext";

export namespace AuthTokenProvider {
    const adResourceId = Config.getValue("UI:AD_RESOURCE_ID");
    const vstsResourceId = Config.getValue("UI:VSTS_RESOURCE_ID");
    const graphResourceId = Config.getValue("UI:GRAPH_RESOURCE_ID");
    const adoOrgApiResourceId = Config.getValue("UI:ADO_ORG_API_RESOURCE_ID");
    let cachedUser: IUser;
    let authContext: IAuthenticationContext;

    export async function authenticateUser(): Promise<boolean> {
        try {
            await acquireAdToken();
            await cacheCurrentUser();

            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(false);
        }
    }

    export async function isTokenRenewalInProgress(): Promise<boolean> {
        initializeAuthContext();

        return authContext.isTokenRenewalInProgress();
    }

    export async function handleWindowCallback() {
        initializeAuthContext();

        await authContext.tryHandleWindowCallBack();
    }

    export async function acquireAdToken(): Promise<string> {
        initializeAuthContext();

        return authContext.acquireToken(adResourceId);
    }

    export async function acquireVstsToken(): Promise<string> {
        initializeAuthContext();

        return authContext.acquireToken(vstsResourceId);
    }

    export async function acquireGraphToken(): Promise<string> {
        initializeAuthContext();

        return authContext.acquireToken(graphResourceId);
    }

    export async function acquireAdoOrgToken(): Promise<string> {
        initializeAuthContext();

        return authContext.acquireToken(adoOrgApiResourceId);
    }

    export function getCurrentUser(): IUser {
        return cachedUser;
    }

    export function queueTokenRequestForUsedResourceIds() {
        // tslint:disable-next-line:no-floating-promises -- no need to wait
        acquireVstsToken();
    }

    async function cacheCurrentUser() {
        initializeAuthContext();

        cachedUser = await authContext.getCurrentUser();
    }

    function initializeAuthContext() {
        if (!authContext) {
            authContext = getAuthContext();
        }
    }

    function getAuthContext(): IAuthenticationContext {
        let replyToUrl = VssNavigation.getHubUrl();
        if (!replyToUrl) {
            replyToUrl = VssNavigation.getCurrentUrl();
        }

        const aadConfig: IAuthContextConfig = {
            clientId: Config.getValue("UI:AD_CLIENT_ID"),
            redirectUri: Config.getValue("UI:AD_REDIRECT_URI"),
            cacheLocation: Config.getValue("UI:CACHE_LOCATION") === "sessionStorage" ? "sessionStorage" : "localStorage",
            loadFrameTimeout: 60000,
            state: `reply_to=${replyToUrl}`
        };

        const isInsideIFrame = (window.parent !== window) && (ProductCatalogUIContext.isStandaloneUI !== true);

        return AuthContextFactory.getAuthContext(aadConfig, isInsideIFrame);
    }
}
