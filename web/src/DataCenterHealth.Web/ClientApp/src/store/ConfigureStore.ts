import { applyMiddleware, createStore, Store } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import thunk from "redux-thunk";
import { Config } from "~/config";
import { productCatalogRootReducer } from "~/store/RootReducer";
import { actionTracerMiddleware } from "~/metrics/ActionTracerMiddleware";

export default function configureStore(): Store {
    let middleware;
    if (Config.getValue("UI:REDUX_DEVTOOLS") === "True") {
        middleware = composeWithDevTools(applyMiddleware(thunk, actionTracerMiddleware));
    } else {
        middleware = applyMiddleware(thunk, actionTracerMiddleware);
    }

    return createStore(
        productCatalogRootReducer,
        middleware
    );
}
