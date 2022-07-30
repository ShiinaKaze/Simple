<template>
    <el-main class="main">
        <AppItem v-for="app in backDatas" :key="app._id" :appData="app" :server="server" @update="updateApps">
        </AppItem>
        <el-button class="add-app" type="primary" icon="el-icon-plus" style="margin: 10px;" @update="updateApps"
            @click="add">
        </el-button>
        <router-view :visable.sync="dialogVisible" :dialogTitle="dialogTitle" :server="server" :dialogMode="dialogMode"
            @update="updateApps"></router-view>
    </el-main>
</template>

<script>
import AppItem from './AppItem.vue'

export default {
    name: 'AppContainer',
    data() {
        return {
            activeIndex: '1',
            dialogTitle: '添加',
            dialogVisible: false,
            dialogMode: 'addApp'
        }
    },
    props: {
        server: {
            type: String,
            default: ''
        },
        backDatas: {
            type: Array
        }
    },

    methods: {
        updateApps() {
            this.$emit('updateApps')
        },
        add() {
            this.dialogVisible = true
            this.$router.push(
                {
                    path: '/apps/add',
                    query: {
                        title: 'add'
                    }
                }
            )
        }
    },
    components: {
        AppItem
    }
}
</script>

<style>
.main {
    display: flex !important;
    flex-wrap: wrap;
    width: 100%;
}

.add-app {
    height: 150px;
    flex-basis: 20%;
    margin: 10px;
}

.add-app i {
    font-size: 60px;
}
</style>