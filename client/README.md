## To-Do
- Add Game Recommender
- Add Social Features
   - Shareable Profile w/ Stats & Game Collection
- Import/Export to/from CSV/Excel Spreadsheet
- Polish Game Pages
- Polish Home Page
- Polish About Page
- Double Check All Pages for Polish
- Brainstorm more additions to Stats Page

## GAME RECOMMENDER

### Overview

- User Can Select Preferences: Platform, Genre, Status in Collection
- User can click "Give Me Something Else" on a game recommendation and it will be ignored for future runs of the Recommender until the page is refreshed.
- After clicking ignore, another game will be served.

### Recommendation Stat Points

- Game w/ Highest IGDB Total Rating Score in Your Selection
- Game w/ Highest Number of IGDB Total Ratings in Your Selection
- Game w/ Highest Steam Review Score in Your Selection (Steam API)
- Game w/ Highest Count of Steam Reviews in Your Selection (Steam API)
- Game w/ Highest Aggregated Rating from External Critics in Your Selection(IGDB API)
- Game w Highest Number of Ratings from External Critics in Your Selection(IGDB API)
- Game w/ the most Hype Before Release in Your Selection in Your Selection(IGDB API)
- Game w/ Oldest Release Date in Your Selection
- Game w/ Newest Release Date in Your Selection
- Game Released on the Most Platforms in Your Selection
- Game w/ Shortest Playtime in Your Selection (Time to Complete API https://github.com/ckatzorke/howlongtobeat)
- Game w/ Shortest Time to 100% in Your Selection (Time to Complete API https://github.com/ckatzorke/howlongtobeat)
- Game w/ Longest Playtime in Your Selection (https://github.com/ckatzorke/howlongtobeat)
- Game w/ Longest Time to 100% in Your Selection (https://github.com/ckatzorke/howlongtobeat)
- Truly random game in Your Selection

#### If No Genre Selected:
- Previous Filters + Game In Your Selection in Your Favorite Genre (Genre where user has the most games marked as played)
	- Example: Game w/ Highest IGDB Total Rating Score in Your Favorite Genre
- Previous Filters + Game In Your Selection in Your Least Played Genre (Genre where user has the least games marked as played)

#### If No Platform Selected:
- Previous Filters + Game In Your Selection on Your Favorite Platform (Platform where user has the most games marked as played)
- Previous Filters + Game In Your Selection on Your Least Played Platform (Platform where user has the least games marked as played)

#### If No Status Selected:
- Previous Filters + Game In Your Backlog
- Previous Filters + Game You've Never Played
- Previous Filters + Game You're Playing

#### If Nothing Selected:
- Random Combination of the Above Filters, Random Amount
	Example: Game w/ Highest Steam Review Score in Your Most Played Genre on Your Least Favorite Platform
	Example: Game w/ Shortest Playtime in Your Backlog

