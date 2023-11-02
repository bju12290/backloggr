import { reactive } from 'vue'

export const store = reactive({
    signedIn: '',
    setSignedIn(status) {
        console.log(status)
        this.signedIn = status
        console.log(status)
    }
})