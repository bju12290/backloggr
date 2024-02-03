import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store.js'
import HomeView from '../views/HomeView.vue'
import CollectionManagerView from '../views/CollectionManagerView.vue';
import SearchView from '../views/SearchView.vue';
import AboutView from '../views/AboutView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignUpView.vue')
    },
    {
      path: '/collectionmanager',
      name: 'collection-manager',
      component: CollectionManagerView
    },
    {
      path: '/game/:gameId',
      name: 'game',
      component: () => import('../views/GameView.vue')
    },
    {
      path: '/usersettings',
      name: 'user-settings',
      component: () => import('../views/UserSettingsView.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: SearchView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    }
  ]
})

router.afterEach((to) => {
  // Reset the current state of all navigation items
  store.navigation.forEach(navItem => navItem.current = false);

  // Find the navigation item that matches the current route and set it as current
  const currentNavItem = store.navigation.find(navItem => navItem.href === to.path);
  if (currentNavItem) {
    currentNavItem.current = true;
  }
});

export default router
