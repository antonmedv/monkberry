import typescript from 'typescript'
import pluginTypeScript from 'rollup-plugin-typescript'

export default {
  input: './src/index.ts',
  output: {
    file: './monkberry.js',
    format: 'cjs'
  },

  plugins: [
    pluginTypeScript({typescript})
  ]
}
