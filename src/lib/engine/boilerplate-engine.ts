import { WizardConfig, BoilerplateFile, GeneratedFile, IDETarget, TemplateVariables } from './types';
import { getTemplate } from './templates';
import { getPackageDefinition } from './package-library';
import { getServiceDefinition } from './service-library';
import { extractVariables, compose } from './prompt-composer';
import { getMultiTenantBoilerplate } from './multi-tenant-logic';
import { getEdgeDeploymentBoilerplate } from './edge-deployment-logic';
import { getShardingBoilerplate } from './sharding-logic';
import { getCicdBoilerplate } from './cicd-logic';
import { getSecurityBoilerplate } from './security-guardrails-logic';
import { getScalabilityBoilerplate } from './scalability-logic';
import { getSelfHealingBoilerplate } from './self-healing-logic';
import { getComplianceV2Boilerplate } from './compliance-logic-v2';
import { getShardingV2Boilerplate } from './sharding-logic-v2';
import { getAIGatewayBoilerplate } from './ai-gateway-logic';
import { getSecurityV2Boilerplate } from './security-logic-v2';
import { getObservabilityV2Boilerplate } from './observability-logic-v2';
import { getEdgeV2Boilerplate } from './edge-logic-v2';
import { getComplianceV3Boilerplate } from './compliance-logic-v3';
import { getShardingV3Boilerplate } from './sharding-logic-v3';
import { getSwarmV2Boilerplate } from './swarm-logic-v2';
import { getMarketplaceBoilerplate } from './marketplace-logic';
import { getScalabilityBoilerplate } from './scalability-logic';
import { getChaosV2Boilerplate } from './chaos-logic-v2';
import { getGovernanceBoilerplate } from './governance-logic';
import { getResilienceV2Boilerplate } from './resilience-logic-v2';

/**
 * Boilerplate Engine
 * Generates the full project file structure based on user selections.
 */
export function generateProjectBoilerplate(config: WizardConfig): GeneratedFile[] {
  if (config.includeBoilerplate === false) return [];

  const files: BoilerplateFile[] = [];

  // 1. Collect from template
  const template = getTemplate(config.templateSlug);
  if (template?.boilerplateFiles) {
    files.push(...template.boilerplateFiles);
  }

  // 2. Collect from selected packages
  for (const pkgSlug of config.selectedPackages) {
    const pkg = getPackageDefinition(pkgSlug);
    if (pkg?.boilerplateFiles) {
      files.push(...pkg.boilerplateFiles);
    }
  }

  // 3. Collect from selected services
  for (const svcSlug of config.selectedServices) {
    const svc = getServiceDefinition(svcSlug);
    if (svc?.boilerplateFiles) {
      files.push(...svc.boilerplateFiles);
    }
  // 3.5. Inject Multi-Tenant Logic (Phase 32)
  if (config.isMultiTenant) {
    const multiTenant = getMultiTenantBoilerplate(config.templateSlug);
    if (multiTenant) {
      files.push({
        path: 'src/proxy.ts',
        content: multiTenant.middleware,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'supabase/migrations/multi_tenant_schema.sql',
        content: multiTenant.dbSchema,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.7. Inject Global Edge Logic (Phase 34)
  if (config.isGlobalEdge) {
    const edge = getEdgeDeploymentBoilerplate(config.templateSlug);
    if (edge) {
      files.push({
        path: 'vercel.json',
        content: edge.vercelJson,
        mergeType: 'overwrite'
      });
      // Prepend to middleware/proxy if exists, or create new
      files.push({
        path: 'src/proxy.ts',
        content: edge.edgeConfig,
        mergeType: 'prepend'
      });
    }
  }

  // 3.8. Inject Database Sharding Logic (Phase 37)
  if (config.isSharded) {
    const sharding = getShardingBoilerplate(config.templateSlug);
    if (sharding) {
      files.push({
        path: 'src/lib/db/sharded-client.ts',
        content: sharding.dbClient,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'supabase/migrations/sharding_schema.sql',
        content: sharding.migration,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.9. Inject Sovereign CI/CD Logic (Phase 38)
  if (config.isCicdEnabled) {
    const cicd = getCicdBoilerplate(config.templateSlug);
    if (cicd) {
      files.push({
        path: '.github/workflows/sovereign_deploy.yml',
        content: cicd.deployWorkflow,
        mergeType: 'overwrite'
      });
      files.push({
        path: '.github/workflows/migration_orchestrator.yml',
        content: cicd.migrationWorkflow,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.10. Inject Sovereign Security Guardrails (Phase 39)
  if (config.isSecurityHardened) {
    const security = getSecurityBoilerplate(config.templateSlug);
    if (security) {
      files.push({
        path: 'vercel.json',
        content: security.wafConfig,
        mergeType: 'overwrite'
      });
      files.push({
        path: '.gitleaks.toml',
        content: security.secretScanning,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/middleware/security.ts',
        content: security.securityMiddleware,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.11. Inject Sovereign Scalability Logic (Phase 40)
  if (config.isScalable) {
    const scalability = getScalabilityBoilerplate(config.templateSlug);
    if (scalability) {
      files.push({
        path: 'vercel.scaling.json',
        content: scalability.scalingConfig,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'supabase/migrations/scalability_monitoring.sql',
        content: scalability.autoScalingAlerts,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/utils/scalability.ts',
        content: scalability.scalingClient,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.12. Inject Sovereign Self-Healing Logic (Phase 41)
  if (config.isSelfHealing) {
    const healing = getSelfHealingBoilerplate(config.templateSlug);
    if (healing) {
      files.push({
        path: 'src/lib/utils/resilience.ts',
        content: \`\${healing.circuitBreaker}\n\${healing.retryLogic}\`,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/middleware/healing.ts',
        content: healing.recoveryMiddleware,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.13. Inject Sovereign Compliance 2.0 Logic (Phase 42)
  if (config.isContinuousAudit) {
    const complianceV2 = getComplianceV2Boilerplate(config.templateSlug);
    if (complianceV2) {
      files.push({
        path: 'supabase/migrations/continuous_audit.sql',
        content: complianceV2.auditLogSchema,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/utils/compliance-heartbeat.ts',
        content: complianceV2.complianceHeartbeat,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/middleware/residency.ts',
        content: complianceV2.residencyEnforcement,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.14. Inject Sovereign Sharding 2.0 Logic (Phase 43)
  if (config.isDynamicSharding) {
    const shardingV2 = getShardingV2Boilerplate(config.templateSlug);
    if (shardingV2) {
      files.push({
        path: 'src/lib/utils/shard-coordinator.ts',
        content: \`\${shardingV2.shardCoordinator}\n\${shardingV2.connectionPooling}\`,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/utils/cross-shard-tx.ts',
        content: shardingV2.crossShardTransaction,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.15. Inject Sovereign AI Gateway Logic (Phase 44)
  if (config.isAiGatewayEnabled) {
    const aiGateway = getAIGatewayBoilerplate(config.templateSlug);
    if (aiGateway) {
      files.push({
        path: 'src/lib/ai/gateway.ts',
        content: aiGateway.gatewayClient,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/ai/cache.ts',
        content: aiGateway.edgePromptCache,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/ai/privacy.ts',
        content: aiGateway.privacyProxy,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.16. Inject Sovereign Security 2.0 Logic (Phase 45)
  if (config.isSecurityHardenedV2) {
    const securityV2 = getSecurityV2Boilerplate(config.templateSlug);
    if (securityV2) {
      files.push({
        path: '.github/workflows/security-audit.yml',
        content: securityV2.vulnerabilityScan,
        mergeType: 'overwrite'
      });
      files.push({
        path: '.github/workflows/security-patch.yml',
        content: securityV2.automatedPatching,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'vercel.security.json',
        content: securityV2.hardenedWaf,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.17. Inject Sovereign Observability 2.0 Logic (Phase 46)
  if (config.isObservabilityEnabledV2) {
    const observabilityV2 = getObservabilityV2Boilerplate(config.templateSlug);
    if (observabilityV2) {
      files.push({
        path: 'src/lib/utils/tracing.ts',
        content: observabilityV2.distributedTracing,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/utils/performance-insights.ts',
        content: observabilityV2.performanceInsights,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-telemetry.ts',
        content: observabilityV2.telemetryDashboard,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.18. Inject Sovereign Edge 2.0 Logic (Phase 47)
  if (config.isEdgeV2Enabled) {
    const edgeV2 = getEdgeV2Boilerplate(config.templateSlug);
    if (edgeV2) {
      files.push({
        path: 'src/lib/utils/edge-sync.ts',
        content: \`\${edgeV2.multiCloudSync}\n\${edgeV2.edgeStateSync}\`,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/middleware/steering.ts',
        content: edgeV2.trafficSteering,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.19. Inject Sovereign Compliance 3.0 Logic (Phase 48)
  if (config.isComplianceEnabledV3) {
    const complianceV3 = getComplianceV3Boilerplate(config.templateSlug);
    if (complianceV3) {
      files.push({
        path: '.github/workflows/compliance-patch.yml',
        content: complianceV3.autonomousPatching,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/middleware/compliance.ts',
        content: complianceV3.policyEnforcement,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/compliance/reporting.ts',
        content: complianceV3.auditReporting,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.20. Inject Sovereign Sharding 3.0 Logic (Phase 49)
  if (config.isShardingEnabledV3) {
    const shardingV3 = getShardingV3Boilerplate(config.templateSlug);
    if (shardingV3) {
      files.push({
        path: 'src/lib/db/rebalancing.ts',
        content: shardingV3.rebalancingOrchestrator,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/db/migration.ts',
        content: shardingV3.migrationTools,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-shard-health.ts',
        content: shardingV3.shardHealthMonitor,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.21. Inject Sovereign Swarm 2.0 Logic (Phase 50)
  if (config.isSwarmEnabledV2) {
    const swarmV2 = getSwarmV2Boilerplate(config.templateSlug);
    if (swarmV2) {
      files.push({
        path: 'src/lib/swarm/evolution.ts',
        content: swarmV2.evolutionEngine,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-architectural-insights.ts',
        content: swarmV2.selfImprovingHooks,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/swarm/hatcher.ts',
        content: swarmV2.swarmFeatureGen,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.22. Inject Sovereign Marketplace Logic (Phase 51)
  if (config.isMarketplaceEnabled) {
    const marketplace = getMarketplaceBoilerplate(config.templateSlug);
    if (marketplace) {
      files.push({
        path: 'src/lib/marketplace/index.ts',
        content: \`\${marketplace.skillDiscovery}\n\${marketplace.capabilitySharing}\`,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-marketplace.ts',
        content: marketplace.installationHook,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.23. Inject Sovereign Scalability Logic (Phase 40)
  if (config.isScalabilityEnabled) {
    const scalability = getScalabilityBoilerplate(config.templateSlug);
    if (scalability) {
      files.push({
        path: 'vercel.json',
        content: scalability.scalingConfig,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'supabase/migrations/scalability_alerts.sql',
        content: scalability.autoScalingAlerts,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/scalability.ts',
        content: scalability.scalingClient,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.24. Inject Sovereign Chaos 2.0 Logic (Phase 41)
  if (config.isChaosEnabledV2) {
    const chaos = getChaosV2Boilerplate(config.templateSlug);
    if (chaos) {
      files.push({
        path: 'src/lib/chaos/playbooks.ts',
        content: chaos.recoveryPlaybooks,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-chaos-resilience.ts',
        content: chaos.chaosMonitor,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/chaos/testing.ts',
        content: chaos.resilienceTesting,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.25. Inject Sovereign Multi-Agent Governance Logic (Phase 52)
  if (config.isGovernanceEnabled) {
    const governance = getGovernanceBoilerplate(config.templateSlug);
    if (governance) {
      files.push({
        path: 'src/lib/governance/dao.ts',
        content: governance.daoProtocol,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/governance/sparc.ts',
        content: governance.sparcEnforcement,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/hooks/use-governance.ts',
        content: governance.governanceHooks,
        mergeType: 'overwrite'
      });
    }
  }

  // 3.26. Inject Autonomous Sovereign Resilience 2.0 Logic (Phase 53)
  if (config.isResilienceEnabledV2) {
    const resilience = getResilienceV2Boilerplate(config.templateSlug);
    if (resilience) {
      files.push({
        path: 'src/lib/resilience/prediction.ts',
        content: resilience.predictiveDetection,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/resilience/orchestrator.ts',
        content: resilience.chaosOrchestration,
        mergeType: 'overwrite'
      });
      files.push({
        path: 'src/lib/resilience/sync.ts',
        content: resilience.resilienceSync,
        mergeType: 'overwrite'
      });
    }
  }

  // 4. Filter by condition
  const filteredFiles = files.filter(file => {
    if (file.targetTemplate && file.targetTemplate !== config.templateSlug) return false;
    if (!file.condition) return true;
    const { field, value } = file.condition;
    return config.stackConfig[field] === value;
  });

  // 5. Merge logic
  return resolveFileConflicts(filteredFiles, config);
}

/**
 * Resolves conflicts when multiple sources provide the same file path.
 * Special logic for package.json merging and marker injection.
 */
function resolveFileConflicts(files: BoilerplateFile[], config: WizardConfig): GeneratedFile[] {
  const fileMap: Record<string, GeneratedFile> = {};
  const packageJsons: BoilerplateFile[] = [];

  for (const file of files) {
    if (file.mergeType === 'package-json') {
      packageJsons.push(file);
      continue;
    }

    if (fileMap[file.path]) {
      // Conflict resolution
      if (file.mergeType === 'append') {
        fileMap[file.path].content += '\n' + file.content;
      } else if (file.mergeType === 'prepend') {
        fileMap[file.path].content = file.content + '\n' + fileMap[file.path].content;
      } else if (file.mergeType === 'inject' && file.injectMarker) {
        const marker = file.injectMarker;
        fileMap[file.path].content = fileMap[file.path].content.replace(
          marker,
          `${file.content}\n${marker}`
        );
      } else {
        // Default: overwrite (last one wins)
        fileMap[file.path] = {
          ideTarget: 'universal',
          filename: file.path.split('/').pop() || '',
          filePath: file.path,
          content: file.content
        };
      }
    } else {
      fileMap[file.path] = {
        ideTarget: 'universal',
        filename: file.path.split('/').pop() || '',
        filePath: file.path,
        content: file.content
      };
    }
  }

  // Process package.json last
  if (packageJsons.length > 0) {
    fileMap['package.json'] = mergePackageJsons(packageJsons, config);
  }

  // Perform interpolation on all files using the shared composer
  const variables = extractVariables(
    config.templateSlug,
    config.templateVersion,
    config.projectName,
    config.stackConfig,
    config.selectedPackages ?? [],
    config.selectedServices ?? [],
    config.experienceLevel ?? 'experienced',
    config.orchestrationMode ?? 'single-agent',
    config.selectedBrains ?? [],
    config.selectedWorkflows ?? [],
    config.designPreset,
    config.swarmTopology,
    config.developmentMethodology,
    config.isMultiTenant,
    config.isGlobalEdge,
    config.isSharded,
    config.isCicdEnabled,
    config.isSecurityHardened,
    config.isScalable,
    config.isSelfHealing,
    config.isContinuousAudit,
    config.isDynamicSharding,
    config.isAiGatewayEnabled,
    config.isSecurityHardenedV2,
    config.isObservabilityEnabledV2,
    config.isEdgeV2Enabled,
    config.isComplianceEnabledV3,
    config.isShardingEnabledV3,
    config.isSwarmEnabledV2,
    config.isMarketplaceEnabled,
    config.isScalabilityEnabled,
    config.isChaosEnabledV2,
    config.isGovernanceEnabled,
    config.isResilienceEnabledV2
  );

  // Add projectSlug manually if not in TemplateVariables
  const varsWithSlug = {
    ...variables,
    projectSlug: config.projectName.toLowerCase().replace(/\s+/g, '-')
  } as any;

  return Object.values(fileMap).map(file => ({
    ...file,
    filePath: interpolateSimple(file.filePath, varsWithSlug),
    filename: interpolateSimple(file.filename, varsWithSlug),
    content: compose(file.content, varsWithSlug)
  }));
}

/**
 * Merges multiple package.json fragments into a single generated file.
 */
function mergePackageJsons(fragments: BoilerplateFile[], config: WizardConfig): GeneratedFile {
  const merged: any = {
    name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
    version: '0.1.0',
    private: true,
    scripts: {},
    dependencies: {},
    devDependencies: {},
  };

  for (const fragment of fragments) {
    try {
      const data = JSON.parse(fragment.content);
      Object.assign(merged.scripts, data.scripts || {});
      Object.assign(merged.dependencies, data.dependencies || {});
      Object.assign(merged.devDependencies, data.devDependencies || {});
      
      // Merge other fields if needed
      for (const key in data) {
        if (!['scripts', 'dependencies', 'devDependencies'].includes(key)) {
          merged[key] = data[key];
        }
      }
    } catch (e) {
      console.warn("Failed to parse package.json fragment:", fragment.content);
    }
  }

  return {
    ideTarget: 'universal',
    filename: 'package.json',
    filePath: 'package.json',
    content: JSON.stringify(merged, null, 2)
  };
}

/**
 * Simple string interpolation for non-logic fields (paths)
 */
export function interpolateSimple(content: string, variables: Record<string, any>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value === 'string' || typeof value === 'number') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    }
  }
  return result;
}
