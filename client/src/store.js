import { reactive } from 'vue'

export const store = reactive({
    signedIn: '',
    setSignedIn(status) {
        this.signedIn = status
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
    }
})