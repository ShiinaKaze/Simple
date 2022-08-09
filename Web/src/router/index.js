import Vue from 'vue'
import VueRouter from 'vue-router'
import TheApps from '../components/TheApps.vue'
import AppContainer from '../components/AppContainer.vue'
import DialogItem from '../components/DialogItem.vue'
import LoginAndRegister from '../components/LoginAndRegister.vue'
import TheUser from '../components/TheUser.vue'
Vue.use(VueRouter)

const routes = [
  {
    name: 'Login',
    path: '/login',
    component: LoginAndRegister,
    alias: '/register'
  },
  {
    path: '',
    component: TheApps,
    children: [
      {
        path: '/user',
        component: TheUser
      },
      {
        path: '/apps',
        component: AppContainer,
        children: [
          {
            path: 'add',
            component: DialogItem,
            props(query) {
              return {
                title: query.title
              }
            }
          },
          {
            path: 'app',
            component: DialogItem,
            props(query) {
              return {
                id: query._id,
                title: query.title
              }
            }
          }
        ]
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  let token = localStorage.getItem('token')
  if (to.name !== 'Login' && !token) next('/login')
  else next()
})
export default router
