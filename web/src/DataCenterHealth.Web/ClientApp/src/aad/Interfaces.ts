export interface IUserProfile {
    oid: string;
}

export interface IUser {
    userName: string;
    profile: IUserProfile;
}

export interface IAuthenticationContext {
    acquireToken(resourceId: string): Promise<string>;
    getCurrentUser(): Promise<IUser>;
    tryHandleWindowCallBack(): Promise<boolean>;
    isTokenRenewalInProgress(): Promise<boolean>;
}

export interface IAuthContextConfig {
    clientId: string;
    redirectUri?: string;
    postLogoutRedirectUri?: string;
    popUp?: boolean;
    cacheLocation?: "localStorage" | "sessionStorage";
    loadFrameTimeout?: number;
    state?: string;
}
