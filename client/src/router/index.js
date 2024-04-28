import { createRouter, createWebHistory } from 'vue-router'
import { store } from '../store.js'
import { getAuth, onAuthStateChanged } from "firebase/auth";
import HomeView from '../views/HomeView.vue'
import CollectionManagerView from '../views/CollectionManagerView.vue';
import SearchView from '../views/SearchView.vue';
import AboutView from '../views/AboutView.vue';
import ContactView from '../views/ContactView.vue'
import UserStatsView from '../views/UserStatsView.vue'
import UserPageView from '../views/UserPageView.vue'

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
      component: () => import('../views/UserSettingsView.vue'),
      meta: { requiresAuth: true },
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
    },
    {
      path: '/policies',
      name: 'policies',
      component: AboutView
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView
    },
    {
      path: '/userstats',
      name: 'userStats',
      component: UserStatsView
    },
    {
      path: '/user/:username',
      name: 'userPage',
      component: UserPageView
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

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isLoginPage = to.name === 'login';
  const isSignupPage = to.name === 'signup';

  // Use a promise to wait for the auth state to be initialized if it's not set yet.
  // This assumes there's a mechanism to resolve this promise once the auth state is known,
  // for example, by listening to Firebase auth state changes.
  const waitForAuthInitialization = new Promise((resolve) => {
    if (store.authInit) {
      resolve(); // If already initialized, proceed immediately.
    } else {
      // Listen for a one-time auth state change.
      const unsubscribe = getAuth().onAuthStateChanged(user => {
        store.signedIn = !!user;
        store.authInit = true; // Ensure these states are updated accordingly.
        unsubscribe(); // Stop listening to further changes here.
        resolve();
      });
    }
  });

  await waitForAuthInitialization;

  // After ensuring auth state is initialized, proceed with routing logic.
  if (store.signedIn) {
    if (isLoginPage || isSignupPage) {
      next({ name: 'collection-manager' });
    } else {
      next();
    }
  } else {
    if (requiresAuth) {
      next({ name: 'login' });
    } else {
      next();
    }
  }
});

export default router
