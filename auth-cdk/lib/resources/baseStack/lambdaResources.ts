import { Construct } from "constructs";
import { POST_CONFIRMATION_FUNCTION_PATH } from '../../../config/lambdaPathsConfig';
import { DefaultNodejsFunction } from "../../constructs/defaultNodejsFunction";


export interface LambdaResourcesProps {
}

export class LambdaResources extends Construct {
    public readonly postConfirmationFunction: DefaultNodejsFunction;

    constructor(scope: Construct, id: string, props: LambdaResourcesProps) {
        super(scope, id);

        this.postConfirmationFunction = new DefaultNodejsFunction(this, 'PostConfirmationFunction', {
            functionName: 'PostConfirmationFunction',
            relativeEntry: POST_CONFIRMATION_FUNCTION_PATH,
        });
    }
}