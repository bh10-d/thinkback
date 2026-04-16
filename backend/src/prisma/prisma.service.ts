import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

function buildDatabaseUrl(): string {
  const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME, DATABASE_URL } = process.env;

  // Fall back to full URL if individual parts are not set
  if (!DB_USER || !DB_HOST || !DB_NAME) {
    return DATABASE_URL ?? '';
  }

  const password = DB_PASSWORD ? `:${encodeURIComponent(DB_PASSWORD)}` : '';
  const port = DB_PORT ?? '5432';
  return `postgresql://${DB_USER}${password}@${DB_HOST}:${port}/${DB_NAME}`;
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ datasources: { db: { url: buildDatabaseUrl() } } });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
