<template>
    <el-main class="main-apps">
        <div class="wrap-apps">
            <AppItem v-for="AppData in AppDatas" :key="AppData._id" :AppData="AppData" @updateApps="updateApps">
            </AppItem>
            <el-button class="add-app" type="primary" icon="el-icon-plus" style="margin: 10px;" @updateApps="updateApps"
                @click="add">
            </el-button>
            <router-view :visable.sync="dialogVisible" :dialogTitle="dialogTitle" :dialogMode="dialogMode"
                @updateApps="updateApps"></router-view>
        </div>
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
        AppDatas: {
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
@media (max-width: 425px) {
    .wrap-apps {
        flex-direction: column;
    }
}

.wrap-apps {
    display: flex;
    flex-wrap: wrap;
}

.add-app {
    width: 300px;
    height: 150px;
    margin: 10px;
}

.add-app i {
    font-size: 60px;
}
</style>