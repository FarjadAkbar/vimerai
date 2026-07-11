import { registerAs } from '@nestjs/config';
import { join } from 'path';

export default registerAs('kit', () => ({
  /** Single active kit for personal ecommerce use (v1). */
  activeKitId: process.env.ACTIVE_KIT_ID || 'nitro-shine',
  /** Repo root kit folder (relative to backend cwd or monorepo root). */
  rootDir:
    process.env.KIT_ROOT_DIR || join(process.cwd(), '..', 'kit'),
}));
