import { routerReducer } from "react-router-redux";
import { combineReducers } from "redux";
import { StateType } from "typesafe-actions";
import { uiRoot } from "~/store/UIRootReducer";

const dataCenterRootReducer = combineReducers(
    {
        uiRoot,
        routing: routerReducer
    }
);

type RootState = StateType<typeof dataCenterRootReducer>;

export {
    dataCenterRootReducer,
    RootState
};
