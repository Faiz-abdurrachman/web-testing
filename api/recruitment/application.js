import { createRecruitmentHandler } from '../../server/recruitment.mjs';
const handle = createRecruitmentHandler();
export default { fetch: (request) => handle(request) };
