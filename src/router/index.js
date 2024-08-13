import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/components/Main.vue'
import Map from '@/components/Map.vue'
import BookMark from '@/components/BookMark.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main
  },
  {
    path: '/Map',
    name: 'Map',
    component: Map
  },
  {
    path: '/BookMark',
    name: 'BookMark',
    component: BookMark
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router