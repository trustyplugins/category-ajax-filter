import {
  canUseFeature,
  canUseFilterModule,
  canUsePostModule,
  getMaxLayouts,
  getTier,
  getUpgradeUrl,
  isModuleLocked,
  isProTier,
} from './capabilities';

/**
 * React hook wrapper for tier helpers.
 */
export default function useTier() {
  return {
    tier: getTier(),
    isPro: isProTier(),
    upgradeUrl: getUpgradeUrl(),
    maxLayouts: getMaxLayouts(),
    canUseFilterModule,
    canUsePostModule,
    canUseFeature,
    isModuleLocked,
  };
}
