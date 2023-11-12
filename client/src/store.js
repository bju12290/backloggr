import { reactive } from 'vue'

export const store = reactive({
    signedIn: '',
    setSignedIn(status) {
        this.signedIn = status
        console.log(status)
    },
    userData: {},
    uid: '',
    setUid(userId) {
        this.uid = userId
    },
})