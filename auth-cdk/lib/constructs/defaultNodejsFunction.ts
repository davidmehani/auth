import { RemovalPolicy } from 'aws-cdk-lib';
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { getPathForLambda } from '../../util/lambdaUtils';

export interface DefaultNodejsFunctionProps extends NodejsFunctionProps {
    relativeEntry: string;
    functionName: string;
}

export class DefaultNodejsFunction extends NodejsFunction {
    constructor(scope: Construct, id: string, props: DefaultNodejsFunctionProps) {
        super(scope, id, {
            ...props,
            functionName: props.functionName,
            entry: getPathForLambda(props.relativeEntry),
            handler: 'handler',
            bundling: {
            minify: true,
                externalModules: ['aws-sdk'],
            },
            logGroup: new LogGroup(scope, `${id}LogGroup`, {
                logGroupName: props.functionName,
                removalPolicy: RemovalPolicy.DESTROY,
            })
        });
    }
}