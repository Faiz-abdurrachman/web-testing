import { createRecruitmentAdminHandler } from '../../../server/recruitment-admin.mjs';
const handle = createRecruitmentAdminHandler();
export default { fetch: (request) => handle(request, 'stats') };
