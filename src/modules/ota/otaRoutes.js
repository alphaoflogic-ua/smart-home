import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import * as otaService from './otaService.js';

const CheckUpdateSchema = z.object({
  device_id: z.string().uuid(),
  device_type: z.string().min(1),
  current_version: z.string().min(1),
});

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export const otaRoutes = async (fastify) => {
  // Public endpoint for devices to check for updates
  fastify.post('/check', async (request, reply) => {
    const validated = CheckUpdateSchema.parse(request.body);
    const latest = await otaService.getLatestFirmware(validated.device_type);

    if (!latest || latest.version === validated.current_version) {
      return { update_available: false };
    }

    return {
      update_available: true,
      version: latest.version,
      firmware_id: latest.id,
      checksum: latest.checksum,
    };
  });

  // Endpoint to download firmware
  fastify.get('/download/:id', async (request, reply) => {
    const { id } = /** @type {{ id: string }} */ (request.params);
    const firmware = await otaService.getFirmwareById(id);

    if (!firmware) {
      return reply.status(404).send({ message: 'Firmware not found' });
    }

    const filePath = path.resolve(firmware.file_path);
    try {
      const stats = await fs.stat(filePath);
      const stream = await fs.readFile(filePath);

      reply
        .header('Content-Type', 'application/octet-stream')
        .header('Content-Length', stats.size)
        .header('Content-Disposition', `attachment; filename="firmware_${firmware.device_type}_${firmware.version}.bin"`)
        .send(stream);
    } catch (err) {
      fastify.log.error({ err, filePath }, 'Failed to read firmware file');
      return reply.status(500).send({ message: 'Failed to read firmware file' });
    }
  });

  // Admin-only (protected) endpoints could be added here to upload firmware
};
