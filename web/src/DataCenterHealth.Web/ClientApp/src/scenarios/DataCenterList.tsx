import * as React from "react";
import { bindActionCreators, Dispatch } from "redux";
import { RootState } from "~/store/RootReducer";

export interface IDataCenterListPageProps {
    count: number;
}

export interface IDataCenterListPageState {
    name: string;
}

class DataCenterListPage extends React.Component<IDataCenterListPageProps, IDataCenterListPageState> {
    constructor(props: IDataCenterListPageProps) {
        super(props);
    }
    public render(): JSX.Element {
        return (<div>
            this.props.name
        </div>);
    }
}


function mapStateToProps(state: RootState) {
    return {
        items: state.products.items,
        error: state.products.error
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return {
        productActions: bindActionCreators(ProductActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ProductListPage);