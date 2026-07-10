/**
 * Generic settings helper to reduce code duplication across role-specific settings
 */

export const flattenSettings = (settings) => {
  if (!settings) return {};

  return {
    ...settings.notifications?.toObject?.() || settings.notifications || {},
    ...settings.privacy?.toObject?.() || settings.privacy || {},
    ...settings.security?.toObject?.() || settings.security || {},
    ...settings.appearance?.toObject?.() || settings.appearance || {},
    ...settings.admin?.toObject?.() || settings.admin || {},
    ...settings.company?.toObject?.() || settings.company || {},
  };
};

export const buildSettingsUpdate = (updates, fieldMappings) => {
  const updateObj = {};

  Object.keys(updates).forEach(key => {
    for (const [section, fields] of Object.entries(fieldMappings)) {
      if (fields.includes(key)) {
        updateObj[`${section}.${key}`] = updates[key];
        break;
      }
    }
  });

  return updateObj;
};

export const getOrCreateSettings = async (SettingsModel, userId) => {
  let settings = await SettingsModel.findOne({ user: userId });

  if (!settings) {
    settings = await SettingsModel.create({ user: userId });
  }

  return settings;
};
