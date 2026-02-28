import { z } from 'zod';
import { verifyToken } from '../../hooks/authHooks.js';
import * as devicesService from './devicesService.js';

const CreateDeviceSchema = z.object({
  home_id: z.string().uuid(),
  room_id: z.string().uuid().optional(),
  name: z.string().min(1),
  type: z.string().min(1),
});

const UpdateDeviceSchema = z.object({
  name: z.string().min(1).optional(),
  room_id: z.string().uuid().optional(),
});

const CommandSchema = z.object({
  home_id: z.string().uuid(),
  command: z.record(z.any()),
});

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export const devicesRoutes = async (fastify) => {
  // All routes in this module require authentication
  fastify.addHook('preHandler', verifyToken);

  fastify.get('/', async (request, reply) => {
    const { homeId } = /** @type {{ homeId?: string }} */ (request.query);
    if (!homeId) {
      return reply.status(400).send({ message: 'homeId query parameter is required' });
    }
    return devicesService.getDevices(homeId);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = /** @type {{ id: string }} */ (request.params);
    const { homeId } = /** @type {{ homeId?: string }} */ (request.query);
    
    if (!homeId) {
      return reply.status(400).send({ message: 'homeId query parameter is required' });
    }

    const device = await devicesService.getDeviceById(id, homeId);
    if (!device) {
      return reply.status(404).send({ message: 'Device not found' });
    }
    return device;
  });

  fastify.post('/', async (request, reply) => {
    const validated = CreateDeviceSchema.parse(request.body);
    const device = await devicesService.createDevice(validated);
    return reply.status(201).send(device);
  });

  fastify.patch('/:id', async (request, reply) => {
    const { id } = /** @type {{ id: string }} */ (request.params);
    const { homeId } = /** @type {{ homeId?: string }} */ (request.query);
    
    if (!homeId) {
      return reply.status(400).send({ message: 'homeId query parameter is required' });
    }

    const validated = UpdateDeviceSchema.parse(request.body);
    const device = await devicesService.updateDevice(id, homeId, validated);
    
    if (!device) {
      return reply.status(404).send({ message: 'Device not found' });
    }
    return device;
  });

  fastify.delete('/:id', async (request, reply) => {
    const { id } = /** @type {{ id: string }} */ (request.params);
    const { homeId } = /** @type {{ homeId?: string }} */ (request.query);
    
    if (!homeId) {
      return reply.status(400).send({ message: 'homeId query parameter is required' });
    }

    const success = await devicesService.deleteDevice(id, homeId);
    if (!success) {
      return reply.status(404).send({ message: 'Device not found' });
    }
    return reply.status(204).send();
  });

  fastify.post('/:id/command', async (request, reply) => {
    const { id } = /** @type {{ id: string }} */ (request.params);
    const validated = CommandSchema.parse(request.body);

    try {
      await devicesService.sendCommand(id, validated.home_id, validated.command);
      return { status: 'sent' };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to send command';
      return reply.status(403).send({ message: msg });
    }
  });
};
