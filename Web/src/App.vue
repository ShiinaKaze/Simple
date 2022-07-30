<template>
  <el-container>
    <el-header class="header">
      <el-menu :default-active="activeIndex" mode="horizontal" :router="true">
        <el-menu-item index="/apps" class="application">应用</el-menu-item>
        <el-submenu index="2" class="user" style="float:right">
          <template slot="title">Shiina</template>
          <el-menu-item index="userSetting" class="user-setting">用户设置</el-menu-item>
          <el-menu-item index="logout" class="logout">登出</el-menu-item>
        </el-submenu>
      </el-menu>
    </el-header>
    <router-view :server="server" :backDatas="backDatas" @updateApps="updateApps"></router-view>
  </el-container>
</template>

<script>
import axios from 'axios'
export default {
  name: "app",
  data() {
    return {
      activeIndex: '/apps',
      server: 'http://localhost:8080',
      backDatas: []
    }
  },
  methods: {
    updateApps() {
      console.log('updateApps:')
      axios.get(this.server + '/apps').then((res) => {
        this.backDatas = res.data
        console.log(this.backDatas)
      })
    }
  },
  beforeMount() {
    console.log('getApps:')
    if (this.$route.path != '/apps') {
      this.$router.push('/apps')
    }
    axios.get(this.server + '/apps').then((res) => {
      this.backDatas = res.data
      console.log(this.backDatas)
    })
  }
}
</script>

<style>
</style>
