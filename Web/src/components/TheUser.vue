<template>
    <el-main>
        <el-tabs tab-position="left">
            <el-tab-pane label="开发者信息" class="userInfo">
                <div class="userAvatar">
                    <el-upload class="avatar-uploader" :headers="uploadHeaders"
                        action="http://localhost:8080/user/upload" :show-file-list="false" list-type="picture-card">
                        <img v-if="userData.avatar" :src="userData.avatar" class="avatar">
                        <i v-else class="el-icon-plus avatar-uploader-icon"></i>
                    </el-upload>
                    <h3 class="userName">{{ userData.userName }}</h3>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="updateUserName">
                    <el-form ref="formUser" :model="formUser" label-width="80px">
                        <el-form-item label="用户名">
                            <el-input v-model="formUser.name" :placeholder="userData.userName"
                                :disabled="isEditing === false"></el-input>
                            <el-button style="margin: 20px 0;" v-if="isEditing === false" type="primary"
                                @click="isEditing = true">
                                修改名称
                            </el-button>
                            <div v-if="isEditing === true" style="margin: 20px 0;">
                                <el-button type="primary" @click="updateUser">确定</el-button>
                                <el-button @click="cancelUpdateUser">取消</el-button>
                            </div>
                        </el-form-item>
                    </el-form>
                </div>
            </el-tab-pane>
            <el-tab-pane label="账号安全" class="userSafe">
                <div class="updatePass">
                    <el-form :model="formPass" status-icon :rules="rules" ref="formPass">
                        <el-form-item label="原密码" prop="prePass">
                            <el-input type="password" v-model="formPass.prePass" autocomplete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="密码" prop="newPass">
                            <el-input type="password" v-model="formPass.newPass" autocomplete="off"></el-input>
                        </el-form-item>
                        <el-form-item label="确认密码" prop="checkPass">
                            <el-input type="password" v-model="formPass.checkPass" autocomplete="off"></el-input>
                        </el-form-item>
                        <el-button type="primary" @click="updatePass('formPass')">提交</el-button>
                    </el-form>
                </div>
                <el-divider direction="vertical"></el-divider>
                <div class="deleteAccount">
                    <el-button type="danger" @click="deleteUser">删除账号</el-button>
                </div>
            </el-tab-pane>
        </el-tabs>
    </el-main>
</template>

<script>
import axiosInstance from '@/utils/axios'
export default {
    name: 'TheUser',
    data() {
        let validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
            } else {
                if (this.formPass.checkPass !== '') {
                    this.$refs.formPass.validateField('checkPass');
                }
                callback();
            }
        };
        let validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.formPass.newPass) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            userData: {},
            isEditing: false,
            uploadHeaders: {
                Authorization: 'Bearer ' + localStorage.getItem('token')
            },
            formUser: {
                name: ''
            },
            formPass: {
                prePass: '',
                newPass: '',
                checkPass: ''
            },
            rules: {
                prePass: [
                    { required: true, message: '请输入原密码', trigger: 'blur' }
                ],
                newPass: [
                    { required: true, validator: validatePass, trigger: 'blur' }
                ],
                checkPass: [
                    { required: true, validator: validatePass2, trigger: 'blur' }
                ]
            }
        }
    },
    props: {
        UserData: {
            type: Object
        }
    },
    methods: {
        updateUser() {
            axiosInstance.post('/user/name', this.formUser).then(() => {
                this.$message({
                    message: '用户名修改成功',
                    type: 'success'
                })
                this.userData.userName = this.formUser.name
                this.formUser.name = ''
                this.isEditing = false
            }).catch((error) => {
                console.log(error)
                this.$message({
                    message: '用户名修改失败',
                    type: 'error'
                })
            })
        },
        cancelUpdateUser() {
            this.formUser.name = ''
            this.isEditing = false
        },
        updatePass(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    axiosInstance.post('/user/pass', this.formPass).then(() => {
                        this.$message({
                            message: '密码修改成功',
                            type: 'success'
                        })
                    }).catch((error) => {
                        console.log(error)
                        this.$message({
                            message: '密码修改失败',
                            type: 'error'
                        })
                    })
                    this.formPass = {
                        prePass: '',
                        newPass: '',
                        checkPass: ''
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });

        },
        deleteUser() {
            this.$prompt('请输密码确认', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
            }).then((inputValue) => {
                axiosInstance.post('/user/delete', inputValue).then(() => {
                    localStorage.removeItem('token')
                    this.$router.push('/login')
                }).catch((error) => {
                    console.log(error)
                    this.$message({
                        message: '密码错误',
                        type: 'error'
                    })
                })
            })
        }
    },
    mounted() {
        this.userData = this.UserData
    }
}
</script>

<style>
.userInfo {
    display: flex;
}

.userAvatar {
    padding: 0 20px;

    width: 200px;
}

.updateUserName {
    width: 400px;
}

.userSafe {
    display: flex;
}

.updatePass {
    padding: 0 20px;
    width: 400px;
}

.deleteAccount {
    padding: 40px 20px;
}

.el-divider {
    height: inherit !important;
}

.avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.avatar-uploader .el-upload:hover {
    border-color: #409EFF;
}

.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 148px;
    height: 148px;
    text-align: center;
}

.avatar {
    width: 148px;
    height: 148px;
    display: block;
}
</style>