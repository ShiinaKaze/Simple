<template>
    <el-dialog :title="dialogTitle" :visible.sync="updateDialogVisable" :center="true" @close="cancel">
        <el-form ref="form" :model="formData">
            <div v-if="dialogMode === 'addApp'">
                <el-form-item label="应用名称">
                    <el-input v-model="formData.title"></el-input>
                </el-form-item>
            </div>
            <div v-if="dialogMode === 'appItem'">
                <el-input :placeholder="dialogTitle" v-model="formData.title" :disabled="isDialogEditing === false"
                    style="margin:20px 0">
                </el-input>
                <el-button v-if="isDialogEditing === false" type="primary" :disabled="appState === 'running'"
                    @click="isDialogEditing = true">
                    修改名称
                </el-button>
                <div v-if="isDialogEditing === true">
                    <el-button type="primary" @click="updateApp">确定</el-button>
                    <el-button @click="cancelUpdateApp">取消</el-button>
                </div>
            </div>
        </el-form>
        <div v-if="this.dialogMode === 'appItem'">
            <h2>Script:</h2>
            <el-upload class="upload-model" :headers="uploadHeaders" :data="dialogData"
                :action="getUploadAdress() + '/script'" :limit="1" :file-list="dialogData.scriptFileList"
                :on-success="handleSuccess" :on-error="handleError"
                :on-remove="(file, fileList) => { return handleRemove(file, fileList, 'script') }">
                <el-button :disabled="appState === 'running'" size="small" type="primary" @click="uploadType = 'model'">
                    点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传python文件</div>
            </el-upload>
            <h2>Model:</h2>
            <el-upload class="upload-model" :headers="uploadHeaders" :data="dialogData"
                :action="getUploadAdress() + '/model'" :limit="5" :multiple="true" :file-list="dialogData.modelFileList"
                :on-success="handleSuccess" :on-error="handleError"
                :on-remove="(file, fileList) => { return handleRemove(file, fileList, 'model') }">
                <el-button :disabled="appState === 'running'" size="small" type="primary" @click="uploadType = 'model'">
                    点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传部署模型文件</div>
            </el-upload>
            <h2>Input:</h2>
            <el-upload class="upload-model" :headers="uploadHeaders" :data="dialogData"
                :action="getUploadAdress() + '/input'" :limit="2" :file-list="dialogData.inputFileList"
                :on-success="handleSuccess" :on-error="handleError"
                :on-remove="(file, fileList) => { return handleRemove(file, fileList, 'input') }">
                <el-button :disabled="appState === 'running'" size="small" type="primary" @click="uploadType = 'model'">
                    点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传符合部署模型的输入文件</div>
            </el-upload>
            <h2>Output:</h2>
            <el-button type="primary" :loading="appState === 'running'" @click="runApp">{{ dialogStateText }}
            </el-button>
            <el-button v-if="appData.outputFileList[0] != ''" @click="handleRemove('', '', 'output')">删除
            </el-button>
            <el-button v-if="appState === 'running'" @click="stopApp">取 消</el-button>
            <div class="ouput-preview" style="margin:20px 0">
                <el-image v-if="appData.outputFileList[0] !== ''" style="width: 20%; height: 20%"
                    :src="appData.outputFileList[0]" :preview-src-list="appData.outputFileList">
                </el-image>
                <el-empty v-loading="appState === 'running'" v-if="appData.outputFileList[0] === ''"></el-empty>
            </div>
        </div>
        <div v-if="this.dialogMode === 'addApp'" slot="footer" class="dialog-footer">
            <el-button @click="updateDialogVisable = false">取 消</el-button>
            <el-button type="primary" @click="addApp">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import axiosInstance from '@/utils/axios'

export default {
    name: 'DialogItem',
    data() {
        return {
            dialogData: this.appData,
            dialogStateText: '运行',
            isDialogEditing: false,
            uploadHeaders: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            formData: {
                title: '',
            },
            tempAppData: {}
        }
    },
    props: {
        visable: {
            type: Boolean,
            default: false
        },
        dialogTitle: {
            type: String,
            default: ""
        },
        dialogMode: {
            type: String,
            default: ''
        },
        appData: {
            type: Object,
        },
        appState: {
            type: String
        }
    },

    methods: {
        addApp() {
            if (!this.formData.title) {
                return
            }

            this.tempAppData = {
                title: this.formData.title,
                state: 'normal'
            }

            axiosInstance.post(this.$route.path, this.tempAppData).then(() => {
                this.$notify({
                    title: '添加成功',
                    message: this.tempAppData.title + '添加成功',
                    type: 'success'
                })
                this.$emit('updateApps')
                this.formData.title = ''
                this.tempAppData = {}

                this.updateDialogVisable = false
            }).catch((err) => {
                console.log(err)
                this.$notify({
                    title: '添加失败',
                    message: this.tempAppData.title + '添加失败',
                    type: 'error'
                })
            })
        },
        updateApp() {
            if (!this.formData.title) {
                return
            }
            this.tempAppData = {
                _id: this.dialogData._id,
                title: this.formData.title,
            }
            axiosInstance.put(this.$route.path, this.tempAppData).then(() => {
                this.$message({
                    message: '修改成功',
                    type: 'success'
                })
                this.tempAppData = {}
                this.$emit('updateApps')
                this.isDialogEditing = false
            }).catch((err) => {
                console.log(err)
            })
        },

        cancelUpdateApp() {
            this.isDialogEditing = false
            this.formData.title = ''
        },


        cancel() {
            this.formData.title = ''
            this.isDialogEditing = false
            this.$router.push('/apps')
        },

        runApp() {
            this.$confirm('此操作将运行该应用 , 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('updateAppState', 'running')
                this.dialogStateText = '运行中'
                this.tempAppData = {
                    id: this.dialogData._id,
                    state: 'running'
                }
                axiosInstance.put(this.$route.path + '/run', this.tempAppData).then(() => {
                    this.$emit('updateAppState', 'normal')
                    this.dialogStateText = '运行'
                    this.$message({
                        type: 'success',
                        message: '运行成功!'
                    })
                    this.$emit('updateApps')
                }).catch(() => {
                    this.$emit('updateAppState', 'normal')
                    this.dialogStateText = '运行'
                    this.$message({
                        type: 'error',
                        message: '运行失败!'
                    })
                })
            }).catch(() => {
                this.dialogStateText = '运行'
                this.$message({
                    type: 'info',
                    message: '已取消运行'
                })
            })
            this.tempAppData = {}
        },

        stopApp() {
            this.$confirm('此操作将取消运行该应用 , 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$emit('updateAppState', 'normal')
                this.dialogStateText = '运行'
                this.tempAppData = {
                    id: this.dialogData._id,
                    state: 'normal'
                }
                axiosInstance.put(this.$route.path + '/stop', this.tempAppData).then(() => {
                    this.$emit('updateAppState', 'running')
                    this.dialogStateText = '运行中'
                    this.$message({
                        type: 'success',
                        message: '取消运行成功!'
                    })
                    this.$emit('updateApps')
                }).catch(() => {
                    this.$emit('updateAppState', 'running')
                    this.dialogStateText = '运行中'
                    this.$message({
                        type: 'error',
                        message: '取消运行失败!'
                    })
                })
                this.tempAppData = {}
            })
        },
        handleSuccess(response, file) {
            this.$message({
                type: 'success',
                message: '文件上传成功!'
            })
            console.log(file)
            this.$emit('updateApps')
        },
        handleError() {
            this.$message({
                type: 'error',
                message: '文件上传失败!'
            })
        },

        handleRemove(file, fileList, folderType) {
            this.tempAppData['id'] = this.dialogData._id
            this.tempAppData['deleteFolderType'] = folderType
            if (folderType === 'script') {
                file = {
                    name: 'script.py'
                }
            }
            if (folderType === 'output') {
                file = {
                    name: this.appData.outputFileList[0].split('/')[5]
                }
            }
            this.tempAppData['file'] = file
            axiosInstance.delete(this.$route.path + '/delete/file', { data: this.tempAppData }).then(() => {
                this.$message({
                    type: 'success',
                    message: '文件删除成功!'
                })
            }).catch(() => {
                this.$message({
                    type: 'error',
                    message: '文件删除失败!'
                })
            })
            this.tempAppData = {}
            this.$emit('updateApps')
        },

        getUploadAdress() {
            return 'http://localhost:8080/apps/app/upload'
        },
    },

    computed: {
        updateDialogVisable: {
            get() { return this.visable },
            set(newVisable) { this.$emit('update:visable', newVisable) }
        },
    }
}
</script>

<style>
</style>