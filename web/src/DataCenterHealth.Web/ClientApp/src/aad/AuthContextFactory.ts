import { AdAuthenticationContext } from "./AuthContext";
import { AuthenticationContextInIFrame } from "./AuthContextInIFrame";
import { IAuthContextConfig, IAuthenticationContext } from "./Interfaces";

export module AuthContextFactory {
    let authContext: IAuthenticationContext;

    export function getAuthContext(aadAuthConfig: IAuthContextConfig, insideIFrame: boolean): IAuthenticationContext {
        if (!authContext) {
            if (insideIFrame) {
                authContext = new AuthenticationContextInIFrame(aadAuthConfig);
            } else {
                authContext = new AdAuthenticationContext(aadAuthConfig);
            }
        }

        return authContext;
    }
}
