import "./index.scss";
import { AuthTokenProvider } from "./aad/AuthTokenProvider";
import { UIInitializer } from "./Init";
import { Metrics } from "./metrics";
import { UIContext } from "./UIContext";
import { History } from "history";
import { GraphServiceAuthenticator } from "office-contact-card";
import { initializeIcons } from "office-fabric/Icons";
import { setIconOptions } from "office-fabric/Styling";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider, Store } from "react-redux";
import { browserHistory, Route, Router } from "react-router";
import { syncHistoryWithStore } from "react-router-redux";
import configureStore from "~/store/ConfigureStore";
import { DataCenterList } from "./scenarios/DataCenterList";

// tslint:disable-next-line:no-any
let store: Store<any>;
let history: History;

UIInitializer.initialize();

if (/^\/land/i.test(window.location.pathname)) {
    UIContext.isStandaloneUI = true;
    AuthTokenProvider.authenticateUser()
        .then(async () => {
            const url = await productCatalogLand.buildProductLandingUrl(window.location.pathname);
            window.location.replace(url);
        })
        .catch();
} else {
    renderPage();
}

function renderPage() {
    VSS.init({
        usePlatformScripts: false,
        usePlatformStyles: false
    });
    GraphServiceAuthenticator.setAuthCallback(AuthTokenProvider.acquireGraphToken);

    VSS.ready(async () => {
        UIContext.isStandaloneUI = false;
        if (VSS.isMock !== undefined) {
            UIContext.isStandaloneUI = VSS.isMock;
        }

        try {
            const isTokenRenewalInProgress = await AuthTokenProvider.isTokenRenewalInProgress();
            if (isTokenRenewalInProgress) {
                await AuthTokenProvider.handleWindowCallback();
            } else {
                await authenticateAndRenderPage();
            }
        } catch (error) {
            renderUnAuthenticatedPage();
        }
    });
}

async function authenticateAndRenderPage() {
    store = configureStore();
    history = syncHistoryWithStore(browserHistory, store);
    setIconOptions({ disableWarnings: true });
    initializeIcons();
    try {
        await AuthTokenProvider.authenticateUser();
        AuthTokenProvider.queueTokenRequestForUsedResourceIds();
        Metrics.init();
        renderAuthenticatedPage();
    } catch (error) {
        renderUnAuthenticatedPage();
    }
}

function renderUnAuthenticatedPage() {
    ReactDOM.render(<div />, document.getElementById("main"));
}

function renderAuthenticatedPage() {
    ReactDOM.render(
        <Provider store={store}>
            <Router history={history}>
                <Route
                    path="/"
                    component={DataCenterList}
                    onEnter={() => Metrics.trackPageView("ProductList")}
                />
                <Route
                    path="Product/:id(/:panel)(/:edit)"
                    component={ProductPage}
                    onEnter={() => Metrics.trackPageView("ProductDetails")}
                />
            </Router>
        </Provider>,
        document.getElementById("main")
    );
}
