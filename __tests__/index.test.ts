import { describe, test } from 'vitest';
import { createApiKey } from '../lib/api-key.js';

// fake for tests
const privateKey =
  'eyJhbGciOiJSUzI1NiIsImt0eSI6IlJTQSIsImUiOiJBUUFCIiwiZCI6IlEzSFh4bjBmWUJIV2U2NUdQVGxiV0k2OFBfQTZhb0YzYWV2dGdmX3JJQVJfeThjWE9tNkRXOTJBbGhTc2pwcU1HeUo1US1zMDVicV9oS2lVRGg0Sk1URFROdkZKWkZOY3VnUzZ1bXRGLWpiRVp1c1RxMzlGU3NyUTJIcEVFVy1sa2ZlVVZ6UUJ4ZXdRUE1oemVuVWY3ZFZ6dkpSMUhqVkVZRFJBckpFOEUtd2x5UXNlNUgyOENzM0dOUEt1OXBtZXlrTFBQazhrYU5SZ0hoMWhCc21kTk5zSzhCa2VSWFJXZEVDQnpPc0tsakVFUWdiZUxWam5SNGt3b3FpbGJybExOX3BVY3Q5RHZ4LTdkNEtGNDRZODNwdWZmOFVTMmgtemp4eW11ZFZyd3pxNHliYkR2SHlWY0hORjV4WnlQNDcxNWpoRnNaaXAyVTkzdS1RMVFRSXRKUSIsIm4iOiJ5Uzg0NVFxOFdGQWFLaTFvS0RmTDNqWE9mNkU2RTRRRm0tX01EZm5IZjY4V0gtRG1va1l6WnIxaWtLeVN5SWdzWS04bjZDUnBDcnV4YjNWTmxNcUczTjBXN0M0VGExcE1OVndacGRORnk1WWRLVWhpRjliYXVGN2p1dGpFcnAwRnN2dHJKTEM1dFdQeVlJVjgtLVpTMG1TS1BWT2c3WExkeENDMHFYY25xTTVkemZZczRnX3hrRFN5VFhSeFB4WVhzR0Z1aUV5VC1kM1NUXzRaWVFzN2x2bHAwdE5QQUJMUFNoRS14OE81aTVSemFhU0hjM0o5UmdseDMyemVuMEpnQkJMSTRiMmZEbmdEX0FJRnRJS1BabmNseUE0LTlBS1dGdGJPTi1ySndrZXFUOGxEOGN3NElFQkxVUVNGR2dvZmZKbXVtempEdGpKcVZCMThjRW5PT3ciLCJwIjoiX2ZkSzBpUHZSUGFsTXFMbmpWVTRBZjBycU9nNHRHeXIxbjQ4MXl4S3QyS1daeXV6NFp2Z1dXUDI4R05mVkJGWC1FcnQyaF9jZnIyNXRrNVFBSVkyVXVvZlFxQ3NSRzdlTm5xOXNsdXJISmlUQkhDTFluUGE0UlJaY2xna1A1YmVMbU1VLTRJTDBkSVJSVHcyR2ZzTDBsUUs5WlFkSlNXRE1yRG00UU9WRnhjIiwicSI6InlzdTJOWU5tYnkwS3VXTTMyV3JwalRYRS1CSTZTQTc5UDFUQ0hRZEl5VmVSS1JSV0VLUUdncU9sWnJYeVAyVmxQWHg4d0syT1NQWFNzWFhqODg2WUZHRjFmZGJPRkhIZmNKYlVPcE1KTmFJVWFqSjMtaG1sYUJYaHlJN25PUEViRGVuQzhSV2dJdG9GeFlmb0N3YnQtTHpZTTRKWXlBUjE4b0lJOG5aanVIMCIsImRwIjoiNmhrYkZOMGUzdGpqcWV0VHVZbUdHUDhfVVhETlpES1BxeVd0LTBIT2xZQUExNVVIT0wwd2JmV2hXRENoWEtLb0RpMHpWazdzTnItNEFmM3A3TEhLUFYtbDlRcWFBSEtaem1vUmxlaTlyNXhNV0ZsTmdqRDgzMkNjbXJQNHBjenhmSnpFYUptVlA1RjliZTUwaURwS3lWUEN6bF83QlpTd2ZQZG51cDVNdlgwIiwiZHEiOiJaSFk2VTVRLW9JQzl1VTB2azZObEE3RkpYR01iUUNzOHhhemxaS0FCTE0wV2VqVTYxWS1NTWhlRGpyZ193NndsVlNwZ1dzc2ZtNEU3MlBHXzlUMjVGUS1hdHJZODdOX2tndEFWWHRjTVR1ZDJHWTNhNWFqaXlnZGRESV9PZC1UcE5DRkRrMDdWUDY2bUFVN3NZdG9SOVpFSHdheW04cDlURnNuWVNOVGhYYmsiLCJxaSI6IjhiNTRpdGUxWGtnNkxJa2FxdDgzTE80RG13eTVld3NYWjlBOGJXdmZQSEFuZEY1LWgzTkQyMzdOOUpnaGY1d2hzR09tRVZhTWd2NTdSZU1SakJZRGs0RWVMeWhvOW5jemY5ZU5fbmdFd3JkbWxjQ1NtV1NPNG9fdHdDaGc2b0hwN05WRkJBLWJsSjJmb1ZfNkxYNnl6RE9mcFVfeWR6ZmJkeWV1eXI5WGZmbyIsImtpZCI6ImNYc2hWTndTdkRaOCJ9';

describe('Basic', () => {
  // fake for tests
  const teamId = 'z7t7j3d8cTD';
  // fake for tests
  const eventSourceId = 'K7pWQnDx8z2Y';
  // fake for tests
  const channelName = 'main';

  test('Nothing', async () => {
    const staticApiKey = await createApiKey({
      privateKey,
      teamId,
      // ttlSecs: 3600,
      claims: {
        //   // this is kind of like the user agent for an API call
        //   // issuer: 'https://test.invalid',
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
    //     // issuer: 'https://test.invalid',
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
