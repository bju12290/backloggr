<script>
import { ref, onMounted, computed } from 'vue';
import { getDatabase, ref as dbRef, onValue } from 'firebase/database';
import { store } from '../store'

// export default {
//   setup() {
//     const data = ref([]);

//     onMounted(() => {
//       // Create a reference to the Firebase database
//       const database = getDatabase();
//       console.log(database)

//       // Reference to the specific node in the database you want to fetch data from
//       const dataRef = dbRef(database); // Replace with your actual database node path
//       console.log(dataRef)
//       // Fetch data from the database
//       onValue(dataRef, (snapshot) => {
//         if (snapshot.exists()) {
//           data.value = snapshot.val();
//           const username = snapshot.val().data.users.user_id_1.username
//           console.log(data.value.data.users.user_id_1.username)
//         }
//       });
//     });

//     const username = computed(() => {
//     if (data.value && data.value.data) {
//       return data.value.data.users.user_id_1.username;
//     }
//     return null; 
//   });

//     return {
//       data,
//       username
//     };
//   },
// };
</script>

<template>
  <main>
    <div>
      
    </div>
  </main>
</template>
