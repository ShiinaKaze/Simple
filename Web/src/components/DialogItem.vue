<template>
    <el-dialog :title="dialogTitle" :visible.sync="updateDialogVisable" :center="true" @close="cancel">
        <el-form ref="form" :model="formData">
            <div v-if="this.dialogMode === 'addApp'">
                <el-form-item label="应用名称">
                    <el-input v-model="formData.title"></el-input>
                </el-form-item>
            </div>
            <div v-if="this.dialogMode === 'appItem'">
                <el-input :placeholder="dialogTitle" v-model="formData.title" :disabled="isDialogEditing === false"
                    style="margin:20px 0">
                </el-input>
                <el-button v-if="isDialogEditing === false" type="primary" :disabled="this.appData.state === 'running'"
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
            <h2>Model:</h2>
            <el-upload class="upload-model" :data="this.appData" :action="getUploadAdress() + '/model'" :multiple="true"
                :limit="5" :file-list="this.appData.modelFileList" :on-success="handleSuccess" :on-error="handleError"
                :on-remove="(file, fileList) => { return handleRemove(file, fileList, 'model') }">
                <el-button :disabled="this.appData.state === 'running'" size="small" type="primary"
                    @click="uploadType = 'model'">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <h2>Input:</h2>
            <el-upload class="upload-model" :data="this.appData" :action="getUploadAdress() + '/input'"
                :multiple="false" :limit="5" :file-list="this.appData.inputFileList" :on-success="handleSuccess"
                :on-error="handleError"
                :on-remove="(file, fileList) => { return handleRemove(file, fileList, 'input') }">
                <el-button :disabled="this.appData.state === 'running'" size="small" type="primary"
                    @click="uploadType = 'model'">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
            <h2>Result:</h2>
            <el-button type="primary" :loading="this.appData.state === 'running'" @click="runApp">{{ isRunning }}
            </el-button>
            <el-button v-if="this.appData.state === 'running'" @click="stopApp">取 消</el-button>
            <div class="result-preview" style="margin:20px 0">
                <el-image :preview-src-list="this.appData.resultFileList">
                </el-image>
            </div>
        </div>
        <div v-if="this.dialogMode === 'addApp'" slot="footer" class="dialog-footer">
            <el-button @click="updateDialogVisable = false">取 消</el-button>
            <el-button type="primary" @click="addApp">确 定</el-button>
        </div>
    </el-dialog>
</template>

<script>
import axios from 'axios'

export default {
    name: 'DialogItem',
    data() {
        return {
            isRunning: '运行',
            isDialogEditing: false,
            modelFileList: [],
            inputFileList: [],
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
        server: {
            type: String,
            default: ''
        },
        dialogMode: {
            type: String,
            default: ''
        },
        appData: {
            type: Object,
        },
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

            axios.post(this.server + this.$route.path, this.tempAppData).then(() => {
                this.$notify({
                    title: '添加成功',
                    message: this.tempAppData.title + '添加成功',
                    type: 'success'
                })
                this.$emit('update')
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
                _id: this.appData._id,
                title: this.formData.title,
            }
            axios.put(this.server + this.$route.path, this.tempAppData).then(() => {
                console.log('put succeed')
                this.$message({
                    message: '修改成功',
                    type: 'success'
                })
                this.tempAppData = {}
                this.$emit('update')
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
                this.tempAppData = {
                    _id: this.appData._id,
                    state: 'running'
                }
                axios.put(this.server + this.$route.path + '/run', this.tempAppData).then(() => {
                    console.log('run succeed')
                    this.isRunning = '运行中'
                    this.$message({
                        type: 'success',
                        message: '运行成功!'
                    })
                }).catch(() => {
                    this.$message({
                        type: 'error',
                        message: '运行失败!'
                    })
                })
                this.$emit('update')
            }).catch(() => {
                this.isRunning = '运行'
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
                this.tempAppData = {
                    _id: this.appData._id,
                    state: 'normal'
                }
                axios.put(this.server + this.$route.path + '/stop', this.tempAppData).then(() => {
                    console.log('run succeed')
                    this.isRunning = '运行'
                    this.$message({
                        type: 'success',
                        message: '取消运行成功!'
                    })
                }).catch(() => {
                    this.$message({
                        type: 'error',
                        message: '取消运行失败!'
                    })
                })
                this.tempAppData = {}
                this.$emit('update')
            })

        },
        handleSuccess() {
            this.$message({
                type: 'success',
                message: '文件上传成功!'
            })
            this.$emit('update')
        },
        handleError() {
            this.$message({
                type: 'error',
                message: '文件上传失败!'
            })
        },

        handleRemove(file, fileList, folderType) {
            this.tempAppData = this.appData
            this.tempAppData['deleteFolderType'] = folderType
            this.tempAppData['file'] = file
            axios.delete(this.server + this.$route.path + '/delete/file', { data: this.tempAppData }).then(() => {
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
            this.$emit('update')
        },

        getUploadAdress() {
            return this.server + '/apps/app/upload'
        },
    },

    computed: {
        updateDialogVisable: {
            get() { return this.visable },
            set(newVisable) { this.$emit('update:visable', newVisable) }
        },
    },
}
</script>

<style>
</style>