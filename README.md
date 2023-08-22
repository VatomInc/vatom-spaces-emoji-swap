# Emoji Swap Game 🔌

This [Vatom Spaces](https://vatom.com) plugin enables a game within your space where users can swap and collect emojis.

## Setup

### 1. Install the plugin

You can install the plugin from the Marketplace (once it's published), or by cloning this repo and running:

```bash
npm install
npm run login
npm run sideload <your-space-name>
```

### 2. Configure a Campaign

Go to [Studio](https://studio.vatom.com) and create a new Campaign that will be used for collecting user scores. Once you have the campaign ID, open the Emoji Swap plugin settings and enter the ID there.

You can also configure which emojis appear in the game here as well.

### 3. Play the game

To play the game, click on other users in the space and select Swap Emoji. You get 10 points if you get a new emoji, and 1 point if you get one you already have.

To view your collected emojis and see the leaderboard, press the Emoji Swap button at the bottom.

## Development

- Ensure you have [Node](https://nodejs.org) installed
- Install dependencies with `npm install`
- Login to the Vatom CLI with `npm run login`
- Build and load the plugin into your space with `npm run sideload myspace` (replace `myspace` with your space alias name)
- When ready, publish to the Marketplace with `npm run publish`

> **Note:** You can only sideload plugins in a space you are the owner of.
