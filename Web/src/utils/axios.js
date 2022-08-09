import router from '@/router'
import axios from 'axios'
import { Message } from 'element-ui'

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080'
})

// 请求拦截器
axiosInstance.interceptors.request.use(function (config) {
    let token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = 'Bearer ' + token
    }
    return config
}, function (error) {
    return Promise.reject(error)
})

// 响应拦截器
axiosInstance.interceptors.response.use(function (response) {
    return response;
}, function (error) {
    if (error.response.status === 401) {
        Message.error('请登录！')
        localStorage.removeItem('token')
        router.push('/login')
    }
    return Promise.reject(error);
});

export default axiosInstance