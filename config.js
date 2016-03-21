var ENV = {
  modulePrefix: 'birdy',

  port: 8080,
  environment: 'development',

  FEATURES: {
    // Here you can enable/disable server features
    'with-hashed-selectors': false,
    'with-asset-cache': false,
    'with-view-cache': false,
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
}

module.exports = ENV