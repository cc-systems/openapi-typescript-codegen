import type { Options } from './client/interfaces/Options';
import { HttpClient } from './HttpClient';
import { Indent } from './Indent';
import { getOpenApiSpec } from './utils/getOpenApiSpec';
import { getOpenApiSpecParser } from './utils/getOpenApiSpecParser';
import { postProcessClient } from './utils/postProcessClient';
import { registerHandlebarTemplates } from './utils/registerHandlebarTemplates';
import { writeClient } from './utils/writeClient';

export { HttpClient } from './HttpClient';
export { Indent } from './Indent';

/**
 * Generate the OpenAPI client. This method will read the OpenAPI specification and based on the
 * given language it will generate the client, including the typed models, validation schemas,
 * service layer, etc.
 * @param options Options passed to the generate method
 */
export const generate = async (options: Options): Promise<void> => {
    const {
        exportCore = true,
        exportModels = true,
        exportSchemas = false,
        exportServices = true,
        httpClient = HttpClient.FETCH,
        indent = Indent.SPACE_4,
        postfixModels = '',
        postfixServices = 'Service',
        serviceResponse = 'body',
        useDateType = false,
        useOptions = false,
        useUnionTypes = false,
        write = true,
    } = options;
    const openApi = typeof options.input === 'string' ? await getOpenApiSpec(options.input) : options.input;
    const parser = getOpenApiSpecParser(openApi);
    const templates = registerHandlebarTemplates({
        httpClient,
        serviceResponse,
        useUnionTypes,
        useOptions,
    });

    const client = parser(openApi, options);
    const clientFinal = postProcessClient(client);
    if (write) {
        await writeClient(clientFinal, templates, {
            ...options,
            exportCore,
            exportModels,
            exportSchemas,
            exportServices,
            httpClient,
            indent,
            postfixModels,
            postfixServices,
            serviceResponse,
            useDateType,
            useOptions,
            useUnionTypes,
        });
    }
};

export default {
    HttpClient,
    generate,
};
