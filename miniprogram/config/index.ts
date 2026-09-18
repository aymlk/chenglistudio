import { defineConfig } from '@tarojs/cli'

export default defineConfig(async (merge) => {
  return merge({
    projectName: 'photography-mini',
    date: '2024-1-1',
    designWidth: 375,
    deviceRatio: {
      375: 2,
      640: 2.34,
      750: 1,
      828: 1.81,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    mini: {
      postcss: {
        pxtransform: { enable: true, config: {} },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      postcss: {
        autoprefixer: { enable: true },
        cssModules: { enable: false },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: { enable: false },
      },
    },
  })
})
