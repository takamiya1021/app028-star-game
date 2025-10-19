import { readFile } from 'fs/promises';
import path from 'path';

/**
 * publicディレクトリ配下のファイルを擬似的にfetchするファクトリ
 * テスト専用実装。HTTPサーバーを立てずにJSONを取得できる。
 */
export function createPublicFetcher() {
  return async function fetchFromPublic(input: RequestInfo | URL): Promise<Response> {
    const target = typeof input === 'string' ? input : input instanceof URL ? input.pathname : input.toString();
    const relativePath = target.startsWith('/') ? target.slice(1) : target;
    const absolutePath = path.join(process.cwd(), 'public', relativePath);
    const fileContents = await readFile(absolutePath, 'utf-8');

    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => JSON.parse(fileContents),
    } as unknown as Response;
  };
}
