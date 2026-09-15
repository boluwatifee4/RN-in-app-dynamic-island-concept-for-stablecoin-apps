const {
  withEntitlementsPlist,
  withInfoPlist,
} = require('expo/config-plugins');

const withLiveActivities = (config) => {
  config = withInfoPlist(config, (config) => {
    config.modResults.NSSupportsLiveActivities = true;
    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.live-activities'] = true;
    config.modResults['com.apple.security.application-groups'] = [
      `group.${config.ios?.bundleIdentifier || 'com.aether.stableisland'}`,
    ];
    return config;
  });

  return config;
};

module.exports = withLiveActivities;
