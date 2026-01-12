# TODO List

## Improvements

### Logo `general`

Add a better logo.

### Icon `general`

Add an icon to the website.

### Clean PWA `general`

Clean up the PWA install card.

### Navigation `general`

Add navigation to /feed and /video. On desktop, the navigation should be on the top or on the left side of the page. On mobile, the navigation should be on the bottom of the page.

### Fix thumbnails `feed`

When max-res is not available, fallback to sd, hd, mq and default.

### Save video time `video`

Add a way to save the current video time to the URL.

### Share with timestamp `video`

Add a time selection to set a custom timestamp when sharing with the share button.

### Empty video `video`

When no video ID is specified in the URL, the player doesn't load and the page is empty.

Add a way to insert a video ID manually, which both updates the URL and loads the player with given video ID.

### Privacy `feed` `video`

When fetching video data like titles, thumbnails, and the video itself, YouTube requires access to some user data like an IP address.

Before connecting, add a friendly reminder that the user is about to connect to the internet and share some of their data with the video provider.

## New Features

### Fullscreen `video`

Add a true fullscreen (immersive mode) option for mobile (and desktop?). Must be good looking and easy to use.

### Twitch support `feed` `video`

Add twitch integration for live streams (and videos?).

### Alternative players `video`

Add support for alternative players for playing YouTube videos. The user will be able to choose which player to use from a list of players.

### Music page `general`

Add a page to listen to music.
