<template>
    <div class="wrap-lar">
        <div class="main-lar">
            <el-form class="form" :model="form" ref="form" :rules="rules" status-icon>
                <el-form-item label="用户名" prop="userName">
                    <el-input v-model="form.userName"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="userPass">
                    <el-input type="password" v-model="form.userPass"></el-input>
                </el-form-item>
                <el-form-item v-if="state === 'register'" label="确认密码" prop="checkPass">
                    <el-input type="password" v-model="form.checkPass"></el-input>
                </el-form-item>
                <div class="loginButtons" v-if="state === 'login'">
                    <el-button type="primary" @click="login('form')">登录</el-button>
                    <el-button @click="toRegister">还没有账户？点此注册</el-button>
                </div>
                <div class="registerButtons" v-if="state === 'register'">
                    <el-button type="primary" @click="register('form')">确认注册</el-button>
                    <el-button @click="toLogin">已有账户？点此登录</el-button>
                </div>

            </el-form>
        </div>
    </div>
</template>

<script>
import axiosInstance from '@/utils/axios';

export default {
    name: 'LoginAndRegister',
    data() {
        let validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.form.userPass) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        }
        return {
            state: 'login',
            form: {
                userName: '',
                userPass: '',
                checkPass: ''
            },
            rules: {
                userName: [
                    { required: true, message: '请输入用户名', trigger: 'blur' }
                ],
                userPass: [
                    { required: true, message: '请输入密码', trigger: 'blur' }
                ],
                checkPass: [
                    { required: true, validator: validatePass2, trigger: 'blur' }
                ]
            }
        }
    },
    methods: {
        toLogin() {
            this.state = 'login'
            this.$router.push('/login')
        },
        toRegister() {
            this.state = 'register'
            this.$router.push('/register')
        },
        login(form) {
            console.log(form)
            this.$refs[form].validate((valid) => {
                if (valid) {
                    console.log('login!')
                    axiosInstance.post(this.$route.path, this.form).then((res) => {
                        console.log(res.data)
                        localStorage.setItem('token', res.data)
                        this.$router.push('/apps')
                    }).catch((error) => {
                        console.log(error)
                        this.$message({
                            message: '登录失败',
                            type: 'error'
                        })
                    })
                } else {
                    console.log('error login!!')
                    return false;
                }
            });
        },
        register(form) {
            console.log(form)
            this.$refs[form].validate((valid) => {
                if (valid) {
                    console.log('register!')
                    axiosInstance.post(this.$route.path, this.form).then(() => {
                        this.$message({
                            message: '注册成功',
                            type: 'success'
                        })
                        this.state = 'login'
                        this.$router.push('/login')
                    }).catch((error) => {
                        console.log(error)
                        this.$message({
                            message: '注册失败',
                            type: 'error'
                        })
                    })
                } else {
                    console.log('error register!!')
                    return false;
                }
            });
        },
    },
    mounted() {
        if (this.$route.path !== '/login') {
            this.$router.push('/login')
        }
    }
}
</script>

<style>
.wrap-lar {
    margin: 0;
    height: 100vh;
    display: flex;
    justify-items: center;
    align-items: center;
}

.main-lar {
    width: 450px;
    padding: 20px;
    margin: auto;
    box-shadow: 0 6px 15px rgb(36 37 38 / 10%);
    border-radius: 5px;
}
</style>