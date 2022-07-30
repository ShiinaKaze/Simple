const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  //配置代理服务器
  devServer: {
    proxy: 'http://localhost:3000'
  }
}
