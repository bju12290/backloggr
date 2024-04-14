import { reactive } from 'vue'
import router from './router/index.js'

const currentPath = router.currentRoute.value.path;

export const store = reactive({
  navigation: [
    { name: 'Home', href: '/', current: false },
    { name: 'Collection', href: '/collectionmanager', current: false },
    { name: 'Search', href: '/search', current: false },
    // ...other navigation items
  ],
    signedIn: false,
    setSignedIn(status) {
        this.signedIn = status
    },
    authInitialized: false,
    setAuthInit(status) {
      this.authInitialized = status
    },
    userData: {},
    uid: '',
    setUid(userId) {
        this.uid = userId
    },
    waitForUid: async () => {
        return new Promise((resolve) => {
          const waitForUidInterval = setInterval(() => {
            if (store.uid) {
              clearInterval(waitForUidInterval);
              resolve();
            }
          }, 100);
        });
      },
    selectedPlatforms: [],
    setSelectedPlatforms(platform) {
      this.selectedPlatforms = platform.slice()
    },
    searchTerm: '',
    setSearchTerm(value) {
      this.searchTerm = value
    },
    releaseYearStart: 1958,
    setReleaseYearStart(value) {
      this.releaseYearStart = value
    },
    releaseYearEnd: 2023,
    setReleaseYearEnd(value) {
      this.releaseYearEnd = value
    },
    selectedStatuses: [],
    setSelectedStatuses(value) {
      this.selectedStatuses = value.slice()
    },
    sortValue: '',
    setSortValue(value) {
      this.sortValue = value
    },
    theme: 'light',
    view: 'grid',
})