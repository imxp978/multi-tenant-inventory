import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getTenantConfig } from '../../config/tenants.config';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      throw new BadRequestException('Missing x-tenant-id header');
    }

    if (!getTenantConfig(tenantId)) {
      throw new BadRequestException(`Unknown tenant: ${tenantId}`);
    }

    req['tenantId'] = tenantId;
    next();
  }
}