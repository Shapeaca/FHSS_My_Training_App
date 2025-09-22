import { makeDummy } from '@fhss-web-team/backend-utils';
import { cleanJwtBlacklist } from '../../../cron/jobs/sys/clean-jwt';

export const cleanJwts = makeDummy({
  name: 'Clean jwts',
  description: 'Cleans old jwts from the blacklist table',
  handler: () => cleanJwtBlacklist.fireOnTick(),
});
