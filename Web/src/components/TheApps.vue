<template>
    <el-container>
        <el-header class="header">
            <el-menu :default-active="activeIndex" mode="horizontal" :router="true">
                <el-menu-item index="/apps" class="application">应用</el-menu-item>
                <el-submenu index="2" class="user" style="float:right">
                    <template slot="title">
                        <el-avatar :size="30" :src="UserData.avatar"></el-avatar>{{ UserData.userName }}
                    </template>
                    <el-menu-item index="/user" class="user-setting" @click="userSetting">账号设置</el-menu-item>
                    <el-menu-item class="logout" @click="logout">登出</el-menu-item>
                </el-submenu>
            </el-menu>
        </el-header>
        <router-view :AppDatas="AppDatas" @updateApps="updateApps" :UserData="UserData">
        </router-view>
    </el-container>
</template>
<script>
import axiosInstance from '@/utils/axios'
export default {
    data() {
        return {
            activeIndex: '/apps',
            AppDatas: [],
            UserData: {}
        }
    },
    methods: {
        updateApps() {
            console.log('updateApps:')
            axiosInstance.get('/apps').then((res) => {
                this.AppDatas = res.data
                console.log(this.AppDatas)
            })
        },
        logout() {
            localStorage.removeItem('token')
            this.$router.push('/login')
            console.log('logout')
        },
        userSetting() {
            this.activeIndex = ''
        }
    },
    mounted() {
        console.log('getApps:')
        if (this.$route.path != '/apps') {
            this.$router.push('/apps')
        }
        axiosInstance.get('/apps').then((res) => {
            this.AppDatas = res.data
            console.log(this.AppDatas)
        })
        axiosInstance.get('/user').then((res) => {
            this.UserData = res.data
        })
    }
}
</script>

<style>
.el-avatar {
    margin: 0 10px;
}
</style>