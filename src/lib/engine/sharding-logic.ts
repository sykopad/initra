/**
 * Initra Multi-Region Database Sharding Logic
 * Standardized patterns for enterprise-scale database topologies.
 */

export const SHARDING_TEMPLATES = {
  nextjs: {
    dbClient: \`
import { createClient } from '@supabase/supabase-js';

/**
 * Shard Coordinator Client
 * Dynamically routes queries to regional database shards based on organization context.
 */
export const getShardedClient = (orgSlug: string) => {
  // Shard Map Logic (In production, this would be fetched from a global config or edge config)
  const shardMap: Record<string, string> = {
    'us-east': process.env.SUPABASE_URL_US_EAST!,
    'eu-west': process.env.SUPABASE_URL_EU_WEST!,
    'ap-south': process.env.SUPABASE_URL_AP_SOUTH!,
  };

  // Determine region from org metadata or simple hash
  const region = determineRegionForOrg(orgSlug);
  const shardUrl = shardMap[region] || shardMap['us-east'];
  const shardKey = process.env.SUPABASE_ANON_KEY!;

  return createClient(shardUrl, shardKey);
};

function determineRegionForOrg(orgSlug: string): string {
  // Simplified sharding heuristic
  if (orgSlug.endsWith('-eu')) return 'eu-west';
  if (orgSlug.endsWith('-as')) return 'ap-south';
  return 'us-east';
}
\`,
    migration: \`
-- Global Entity Synchronization Pattern
-- Used for tables that must exist across all shards (e.g., global_users, organizations)

CREATE TABLE IF NOT EXISTS global_registry (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  shard_region TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shard-local data isolation
CREATE TABLE IF NOT EXISTS tenant_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tenant_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant Isolation" ON tenant_data FOR ALL USING (organization_id = auth.jwt()->>'org_id');
\`
  }
};

export function getShardingBoilerplate(templateSlug: string): { dbClient: string; migration: string } | null {
  return (SHARDING_TEMPLATES as any)[templateSlug] || null;
}
