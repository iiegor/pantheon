var ENV = {
  modulePrefix: 'birdy',

  port: 8080,
  environment: 'development',

  FEATURES: {
    // Here you can enable/disable server features
    'with-hashed-selectors': false,
    'with-asset-cache': false,
    'with-view-cache': false,
    'with-view-watch': true,
    'with-https': false
  },

  APP: {
    ASSETS: {
      version: 1,
      path: '{type}/rs={name}',
    }
  }
}

if (ENV.environment === 'production') {
  ENV.FEATURES['with-hashed-selectors'] = true
  ENV.FEATURES['with-view-cache'] = true
  ENV.FEATURES['with-view-watch'] = false
}

module.exports = ENV