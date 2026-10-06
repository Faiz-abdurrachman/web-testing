import { createAdminHandler } from '../../server/cms-admin.mjs';
const handle = createAdminHandler();
export default { fetch: (request) => handle(request, 'projects') };
