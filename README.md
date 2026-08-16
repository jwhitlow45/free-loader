# Support

<a href="https://protectourwinters.org/donate-to-pow/">
    <p align="center">
        <img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/pow.png?raw=true" align="center" width="256"/>
    </p>        
</a>

I maintain this project in my free time as a way to give back to the open-source community that I have greatly benefited from throughout my life. If you'd like to support this project financially, I encourage you to donate directly to Protect Our Winters instead by clicking the image above. I'm fortunate to have a stable career as a full-time software engineer, and Protect Our Winters can make better use of the funds than I can. Thank you.

# Free Loader Decky Plugin

![Free Loader Logo](https://github.com/jwhitlow45/free-loader/blob/main/assets/free-loader-logo.png?raw=true)

Do you hate having to look for free game promotions on external websites, or manually searching for these games on your Steam Deck? Then Free Loader is the right plugin for you!

Free Loader keeps a list of currently free games from Steam, Epic Games Store, GOG, Itch.io, and Amazon Prime right in your Quick Access Menu, and notifies you when new ones show up.

## Features
### View a list of currently free games with links to their store pages
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/games_list.jpg?raw=true"/>

Each game shows its store, its normal price, and how long you have left to claim it.

### Display a QR code to easily claim free games on your mobile device
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/qr_code.jpg?raw=true"/>

### Hide games you've claimed or aren't interested in
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/hidden_games_list.jpg?raw=true"/>

### Check for new free games anytime you like with the click of a button
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/manual_update.jpg?raw=true"/>

### Get a notification when new games are found
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/notification.jpg?raw=true"/>

Clicking a notification takes you straight to the plugin.

## Settings
### Toggle individual stores
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/stores.jpg?raw=true"/>

### Toggle notifications and customize your game list
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/settings.jpg?raw=true"/>

### Set a custom games list update frequency
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/update_frequency.jpg?raw=true"/>

The schedule is remembered across restarts, so if you ask for an update once a week that is what you'll get, no matter how often you reboot your Deck.

### Clear your local games database or restore settings to default
<img src="https://github.com/jwhitlow45/free-loader/blob/main/assets/screenshots/defaults.jpg?raw=true"/>

Both of these ask for confirmation first, so a stray button press won't wipe anything.

# Accessibility
Free Loader has an Accessibility section in its settings. It currently includes a Larger Text mode that increases the text size across the games list, and a toggle to disable all of the plugin's animations.

That said, I am not a front-end developer, and have little to no experience with building accessible applications. If there is anything I could implement to make this plugin more accessible to yourself or anyone else please do not hesitate to create an issue (or PR) and I will do my best to address it with what time I have.

# Disclaimer
This plugin relies on two completely free services:

- [GamerPower](https://www.gamerpower.com/api-read) provides the free games for Steam, Epic Games Store, GOG, and Itch.io. Your system will be making various GET requests to their API, as well as using their provided links which redirect from their website directly to store pages.
- [LootScraper](https://github.com/eikowagenknecht/lootscraper), a free and open-source project by Eiko Wagenknecht, provides the free games for Amazon Prime. Your system will be making GET requests to its feed, and claim links open Amazon's website directly.

I am in no way affiliated with these services, and as such cannot make any guarantees pertaining analytics data collected on users of this plugin.

Both have a good reputation. While I do not think this is of any concern I want to make it very clear that just because I do not collect any analytics pertaining to this plugin, does not mean these services do not.

The plugin *could* be written in a way that circumvents GamerPower's redirects to store pages, only relying on their API. However, given that they are providing an API for FREE the least I can do is use their redirect links. If you really don't like this then I encourage you to fork this plugin and circumvent their redirects as you see fit.

# Installation
Install from the [plugin store](https://plugins.deckbrew.xyz/) for your own safety!

If you are savy enough to install the plugin manually then you are more than welcome to, but be warned there may be security or other vulnerabilities that have not been caught/reviewed. Do so at your own risk!

# Development
Want to hack on Free Loader? Clone the repo and run `make help` to see every available task. The short version:

- `make init` sets up your environment and a `.env` file pointing at your Steam Deck
- `make it` builds the plugin and deploys it to your Deck over SSH
- `make test` runs the backend unit tests locally, no Deck required

Issues and PRs are always welcome.
