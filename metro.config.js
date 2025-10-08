// Learn more https://docs.expo.io/guides/customizing-metro
const {withNativeWind} = require('nativewind/metro');
const {getDefaultConfig} = require('expo/metro-config');

const createConfig = () => {
  // eslint-disable-next-line no-undef
  // const config = getSentryExpoConfig(__dirname);
  const config = getDefaultConfig(__dirname);

  const {transformer, resolver} = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter(ext => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  return config;
};

const config = createConfig();
module.exports = withNativeWind(config, {input: './assets/global.css'});
