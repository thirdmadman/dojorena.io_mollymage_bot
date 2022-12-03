import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
export const app = Fastify();


app.get('/ping', async (request, reply) => {
  return 'pong\n'
})