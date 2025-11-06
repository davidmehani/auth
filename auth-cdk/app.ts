import { App } from 'aws-cdk-lib';
import { ApiStack } from './lib/stacks/apiStack';
import { FrontendStack } from './lib/stacks/frontendStack';
import { BaseStack } from './lib/stacks/baseStack';

const app = new App();

const baseStack = new BaseStack(app, 'BaseStack', {});

const apiStack = new ApiStack(app, 'ApiStack', {
    baseStack: baseStack,
});

const frontendStack = new FrontendStack(app, 'FrontendStack', {})

