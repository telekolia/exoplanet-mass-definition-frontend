import { resolve } from 'path';

import { generateApi } from 'swagger-typescript-api';

await generateApi({
    name: 'Api.ts',
    output: resolve(process.cwd(), './src/api'),
    url: 'http://localhost:8000/swagger/doc.json',
    httpClientType: 'axios',
});
