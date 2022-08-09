<template>
    <el-card class="app">
        <div slot="header" class="app-header">
            <el-link type="primary" :underline="false" @click="infoApp">{{ appData.title }}</el-link>
            <el-button style="float: right;padding: 8px" type="danger" :disabled="appState === 'running'"
                @click="deleteApp">删除
            </el-button>
        </div>
        <div class="app-content">
            <el-tooltip class="item" effect="dark" content="网络模型" placement="top">
                <el-button type="primary" circle icon="el-icon-takeaway-box" @click="infoApp"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="模型参数" placement="top">
                <el-button type="primary" circle icon="el-icon-document" @click="infoApp"></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="预测结果" placement="top">
                <el-button type="primary" circle icon="el-icon-finished" @click="infoApp"></el-button>
            </el-tooltip>
        </div>
        <DialogItem :visable.sync="dialogVisible" :dialogTitle="appData.title" :dialogMode="dialogMode"
            :appData="appData" :appState="appState" @updateApps="updateApps" @updateAppState="updateAppState">
        </DialogItem>
    </el-card>
</template>

<script>
import DialogItem from './DialogItem.vue'
import axiosInstance from '@/utils/axios'
export default {
    name: 'AppItem',
    data() {
        return {
            appData: this.AppData,
            appState: 'normal',
            dialogVisible: false,
            dialogMode: 'appItem'
        }
    },
    props: {
        AppData: {
            type: Object,
        }
    },
    methods: {
        updateApps() {
            this.$emit('updateApps')
        },
        updateAppState(state) {
            this.appState = state
        },
        deleteApp() {
            this.$confirm('此操作将永久删除该应用, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                axiosInstance.delete(this.$route.path + '/delete', { data: this.appData }).then((res) => {
                    console.log('delete:', res.data)
                    this.$notify({
                        title: '删除成功',
                        message: this.appData.title + '删除成功',
                        type: 'success'
                    })
                    this.$emit('updateApps')
                }).catch((err) => {
                    console.log(err)
                    this.$notify({
                        title: '删除失败',
                        message: this.appData.title + '删除失败',
                        type: 'error'
                    })
                })
            }).catch((err) => {
                console.log(err)
            })
        },
        infoApp() {
            this.dialogVisible = true
            this.$router.push(
                {
                    path: '/apps/app',
                    query: {
                        id: this.appData._id,
                        title: this.appData.title
                    }
                }
            )
        }
    },
    watch: {
        AppData() {
            this.appData = this.AppData
        }
    },
    components: {
        DialogItem
    }
}
</script>

<style>
.app {
    width: 300px;
    height: 150px;
    margin: 10px;
}

.app-content {
    display: flex;
    justify-content: center;
}

.item {
    margin: 0 15px !important;
}
</style>