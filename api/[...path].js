let appPromise;

export default async function handler(req, res) {
  appPromise ||= import('../server/index.js').then((module) => module.default);
  const app = await appPromise;
  return app(req, res);
}
