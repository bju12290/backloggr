{
  "rules": {
    "data": {
      ".read": false,
      ".write": false,
      "users": {
        "$uid": {
          ".read": "$uid === auth.uid",
          ".write": "$uid === auth.uid",
          "game_collection": {
            ".read": true,
            ".write": "$uid === auth.uid"
          }
        }
      },
      "usernames": {
        ".read": "auth != null", // All authenticated users can read usernames
        "$uid": {
          // A user can write only their own username entry
          ".write": "$uid === auth.uid",
          // Prevent a user from changing their UID to someone else's username
          ".validate": "newData.isString() && (!data.exists() || data.val() === newData.val())"
        }
      }
    }
  }
}