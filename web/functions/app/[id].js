import { serveApp } from '../_serve.js';
export const onRequestGet = ctx => serveApp(ctx, ctx.params.id);
