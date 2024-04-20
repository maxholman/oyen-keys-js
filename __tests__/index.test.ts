import { readFile } from 'node:fs/promises';
import { describe, test } from '@jest/globals';
import { createApiKey } from '../lib/api-key.js';

const privateKey = await readFile(
  new URL(
    './jwk-dash.oyenlocal.com-z7t7j3d8cTD-cXshVNwSvDZ8.txt',
    import.meta.url,
  ),
  'utf8',
);

describe('Basic', () => {
  const teamId = 'z7t7j3d8cTD';
  const eventSourceId = 'K7pWQnDx8z2Y';
  const channelName = 'main';

  test('Nothing', async () => {
    const staticApiKey = await createApiKey({
      privateKey,
      teamId,
      // ttlSecs: 3600,
      claims: {
        //   // this is kind of like the user agent for an API call
        //   // issuer: 'https://jest.invalid',
        cap: {
          // keys: ['list'],
          // [`emails/${emailId}`]: ['read'],
          [`events/${eventSourceId}/channels/${channelName}`]: [
            'read',
            'publish',
          ],
        },
      },
    });

    // const _transientApiKey = await createApiKey({
    //   privateKey: process.env.OYEN_PRIVATE_KEY,
    //   teamId,
    //   ttlSecs: 3600,
    //   claims: {
    //     sub: teamId,

    //     // this is kind of like the user agent for an API call
    //     // issuer: 'https://jest.invalid',
    //     scopes: {
    //       keys: ['list'],
    //       [`email:${emailId}`]: ['read'],
    //       [`events/${eventSourceId}/channels/${channelName}`]: ['publish'],
    //     },
    //   },
    // });

    console.log({ staticApiKey });
  });
});
