import Vue from 'vue'
import VueRouter from 'vue-router'
import AppContainer from '../components/AppContainer.vue'
import DialogItem from '../components/DialogItem.vue'
Vue.use(VueRouter)

const routes = [
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

const router = new VueRouter({
  routes
})

export default router
