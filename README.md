# wineclaimer

Automate claiming and selling VINTAGE tokens from the [Winemaker P2E game.](https://winemaker.grapefinance.app)

## Requirements
- An internet connection
- Node.js (only tested with 16.14.0, [you should use fnm to manage node versions it's really cool](https://github.com/Schniz/fnm))

## Initial setup

1. Rename `.env.EXAMPLE` to `.env`, add your private key in `.env`.
2. Change settings in `index.js` if you want to.

Make sure to stock up with loads of AVAX for gas fees!

## Running the bot

Just run `yarn start`. You need a 24/7 computer for this to work effectively.

You can use a nice tool called `pm2` to automatically restart this bot if it crashes.
