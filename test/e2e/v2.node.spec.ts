import { cleanup } from './scripts/cleanup';
import { compileWithTypescript } from './scripts/compileWithTypescript';
import { generateClient } from './scripts/generateClient';
import server from './scripts/server';

describe('v2.node', () => {
    beforeAll(async () => {
        cleanup('v2/node');
        await generateClient('v2/node', 'v2', 'node');
        compileWithTypescript('v2/node');
        await server.start('v2/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('requests token', async () => {
        const { OpenAPI, SimpleService } = require('./generated/v2/node/index.js');
        const tokenRequest = jest.fn().mockResolvedValue('MY_TOKEN');
        OpenAPI.TOKEN = tokenRequest;
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(tokenRequest.mock.calls.length).toBe(1);
        expect(result.headers.authorization).toBe('Bearer MY_TOKEN');
    });

    it('supports complex params', async () => {
        const { ComplexService } = require('./generated/v2/node/index.js');
        const result = await ComplexService.complexTypes({
            first: {
                second: {
                    third: 'Hello World!',
                },
            },
        });
        expect(result).toBeDefined();
    });

    it('can abort the request', async () => {
        let error;
        try {
            const { SimpleService } = require('./generated/v2/node/index.js');
            const promise = SimpleService.getCallWithoutParametersAndResponse();
            setTimeout(() => {
                promise.cancel();
            }, 10);
            await promise;
        } catch (e) {
            error = (e as Error).message;
        }
        expect(error).toContain('Request aborted');
    });
});

describe('v2.node useOptions', () => {
    beforeAll(async () => {
        cleanup('v2/node');
        await generateClient('v2/node', 'v2', 'node', true);
        compileWithTypescript('v2/node');
        await server.start('v2/node');
    }, 30000);

    afterAll(async () => {
        await server.stop();
    });

    it('returns result body by default', async () => {
        const { SimpleService } = require('./generated/v2/node/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse();
        expect(result.body).toBeUndefined();
    });

    it('returns result body', async () => {
        const { SimpleService } = require('./generated/v2/node/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'body',
        });
        expect(result.body).toBeUndefined();
    });

    it('returns raw result', async () => {
        const { SimpleService } = require('./generated/v2/node/index.js');
        const result = await SimpleService.getCallWithoutParametersAndResponse({
            _result: 'raw',
        });
        expect(result.body).not.toBeUndefined();
    });
});
