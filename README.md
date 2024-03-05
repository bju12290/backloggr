# Backloggr

## Usage
You can test the application yourself at [this link](https://video-game-collection-tracker.web.app/).

Backloggr is a site intended to help users manage their game collection and backlog. After creating an account, users can add games to their collection individually, or import their games from steam. Once games are added to the users collection, they can organize them by the "status" they hold in their collection (Playing, Completed, Backlog, Dropped, or Never Played). Games can also be sorted by what platform the user intends to play the game on/owns the game on. After organizing, users can then Sort, Search, and Filter their collection to refine their selection, and choose what they might want to play. 

## Technologies Used

### Frontend Development

 - [Vite](https://vitejs.dev/): A build tool that offers fast development and optimized production builds for modern web applications. Used for clientside development and building.
 - [Vue](https://vuejs.org/): A versatile JavaScript framework for creating dynamic and interactive web interfaces. Used throughout the application for re-usable components and full-sized pages. 
 - [Tailwind CSS](https://tailwindcss.com/): A utility-first CSS framework for rapidly building custom designs. Used throughout the application to ensure it remains visually appealing on all screen sizes.
 - [Swiper JS](https://swiperjs.com/): A powerful JavaScript library for creating responsive, mobile-friendly sliders. Used to add some dynamic elements to various parts of the site. 
 - [Animate On Scroll (AOS)](https://michalsnik.github.io/aos/): A library to animate elements on your page as you scroll. Used to add some dynamic-ness to the Collection Grid and the Search Page.

 ### Backend Services

 - [Firebase Cloud Functions](https://firebase.google.com/docs/functions): Serverless functions that allow you to run custom code in response to events in your Firebase project, providing a way to extend and automate the functionality of your application. Firebase Cloud Functions host all server-side functionality for the application.
 - [Firebase Authentication](https://firebase.google.com/docs/auth): Allows developers to easily integrate secure user sign-up, sign-in, and identity management into their web and mobile applications. Does the heavy lifting in terms of account creation and signing in.  
 - [Firebase Realtime Database](https://firebase.google.com/docs/database): A NoSQL cloud database from Google's Firebase platform that enables real-time data synchronization across web and mobile applications. Used to keep track of product popularity, and clientside order IDs.
 - [IGDB API](https://stripe.com/docs/api): The IGDB (Internet Game Database) API provides comprehensive data about video games, allowing developers to access game titles, ratings, reviews, and more for gaming applications or websites. Used throughout the site to fetch information about video games. 
  - [Steamcommunity API](https://developers.printful.com/docs/): The Steam Community API offers access to user profiles, game achievements, and friends lists within the Steam community, enabling developers to integrate Steam user data into their applications or websites. Used to allow users to import their Steam games via their Steam profile link.

 ## Project Structure
 
- **'components/'**: This directory serves as a container for both reusable components and complex single-use components. Each component has it's own corresponding Vue file in the directory. These components are served to our **'/views/'**.
- **'views/'**: This directory serves as a container for all full-sized-pages throughout the site. All pages have a corresponding Vue file inside the **'pages/'** directory.
- **'utils/'**: This directory serves as a container for re-usable utility functions used throughout the site.
- **'router/'**: This directory serves as a container for our router configuration.

 #### Contact Information

Feel free to contact via email! 

```brian.phartnettjr@gmail.com```

 #### Known Issues

 - Steam Library Importing Flow is Not User Friendly
 - If you find any other issues please contact me!

 #### Future Improvements
 - Game Recommendations Based on Statistics, User Interests, Preferences, Etc.
 - Multi-Selecting and Bulk Editing Games in the Game Collection
 - Import and Export Game Collection From/To CSV/Excel Spreadsheet
 - List View and Cover View in Collection Manager
 - Organize Games Into Folders and Subfolders
 - A Page Dedicated to Compiling User Statistics
 - Steam Library Import Moved to Backend (So user can do what they want while it imports)



 

