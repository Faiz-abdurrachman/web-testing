import { createRecruitmentAdminHandler } from '../../../server/recruitment-admin.mjs';

const handle = createRecruitmentAdminHandler();

const ROUTES = {
  applications: 'list',
  application: 'detail',
  stats: 'stats',
  login: 'login',
  refresh: 'refresh',
  callback: 'callback',
  logout: 'logout',
};

// Single catch-all function: the Hobby plan caps a deployment at 12 serverless
// functions, so the recruitment admin routes share one handler instead of one
// file per route (mirrors the sub-path dispatch without extra functions).
export default {
  fetch: (request) => {
    const segments = new URL(request.url).pathname.split('/').filter(Boolean);
    const route = ROUTES[segments[segments.length - 1]] || 'notfound';
    return handle(request, route);
  },
};
