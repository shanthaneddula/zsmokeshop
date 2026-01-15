/**
 * Tenant Context Utilities
 * 
 * Helpers to get tenant information from domain and connect to tenant database.
 * NOTE: Middleware just passes domain, actual tenant lookup happens here in Node.js runtime.
 */

import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';
import { getTenantDb } from './db/tenant-connector';
import { getTenantByDomain } from './db/master-db';

export interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  domain: string;
  dbConfig: {
    host: string;
    user: string;
    password: string;
    port: string;
    database: string;
    projectId: string;
  };
}

/**
 * Get tenant information by looking up domain in master database
 * Use this in API routes and server components
 */
export async function getTenantInfo(): Promise<TenantInfo | null> {
  try {
    const headersList = await headers();
    
    // Get domain from middleware
    const domain = headersList.get('x-forwarded-domain');
    
    if (!domain) {
      console.warn('[TenantContext] No domain in headers');
      return null;
    }

    console.log(`[TenantContext] Looking up tenant for domain: ${domain}`);

    // Lookup tenant in master database (this runs in Node.js, not Edge)
    const tenant = await getTenantByDomain(domain);

    if (!tenant) {
      console.error(`[TenantContext] Tenant not found for domain: ${domain}`);
      return null;
    }

    if (tenant.status !== 'active') {
      console.error(`[TenantContext] Tenant inactive: ${tenant.name}`);
      return null;
    }

    console.log(`[TenantContext] Found tenant: ${tenant.name} (${tenant.slug})`);

    return {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      domain: tenant.customDomain || domain,
      dbConfig: {
        host: tenant.dbHost,
        user: tenant.dbUser,
        password: tenant.dbPassword,
        port: tenant.dbPort.toString(),
        database: tenant.dbName,
        projectId: tenant.supabaseProjectId || '',
      },
    };
  } catch (error) {
    console.error('[TenantContext] Error getting tenant info:', error);
    return null;
  }
}

/**
 * Get tenant database connection
 * Automatically builds connection string and uses connection pool
 */
export async function getTenantDatabase(): Promise<PrismaClient | null> {
  try {
    const tenantInfo = await getTenantInfo();
    
    if (!tenantInfo) {
      console.error('[TenantContext] No tenant info available');
      return null;
    }

    // Build connection string
    const connectionString = `postgresql://${tenantInfo.dbConfig.user}:${tenantInfo.dbConfig.password}@${tenantInfo.dbConfig.host}:${tenantInfo.dbConfig.port}/${tenantInfo.dbConfig.database}`;

    // Get cached or new connection from pool
    const db = await getTenantDb(tenantInfo.id, connectionString);
    
    return db;
  } catch (error) {
    console.error('[TenantContext] Error getting tenant database:', error);
    return null;
  }
}

/**
 * Require tenant context - throws error if not available
 * Use this when tenant context is mandatory
 */
export async function requireTenant(): Promise<TenantInfo> {
  const tenantInfo = await getTenantInfo();
  
  if (!tenantInfo) {
    throw new Error('Tenant context not available. Request must go through domain middleware.');
  }
  
  return tenantInfo;
}

/**
 * Require tenant database - throws error if not available
 */
export async function requireTenantDb(): Promise<PrismaClient> {
  const db = await getTenantDatabase();
  
  if (!db) {
    throw new Error('Tenant database not available. Request must go through domain middleware.');
  }
  
  return db;
}

/**
 * Extract tenant info from NextRequest (for use in route handlers)
 * This version works with NextRequest objects directly
 */
export function extractTenantFromRequest(request: Request): TenantInfo | null {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const tenantSlug = request.headers.get('x-tenant-slug');
    const tenantName = request.headers.get('x-tenant-name');
    const tenantDomain = request.headers.get('x-tenant-domain');
    const dbConfigEncoded = request.headers.get('x-tenant-db-config');

    if (!tenantId || !tenantSlug || !dbConfigEncoded) {
      return null;
    }

    const dbConfig = JSON.parse(
      Buffer.from(dbConfigEncoded, 'base64').toString('utf-8')
    );

    return {
      id: tenantId,
      slug: tenantSlug,
      name: tenantName || '',
      domain: tenantDomain || '',
      dbConfig,
    };
  } catch (error) {
    console.error('[TenantContext] Error extracting from request:', error);
    return null;
  }
}
