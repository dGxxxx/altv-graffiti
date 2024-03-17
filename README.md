#  💨 alt:V Graffiti

Preview: https://streamable.com/lzyz91

## Features:
- Created using alt:V TextLabels.
- Place graffiti almost on every wall from the map.
- You can use hex colors & adding fonts is easy.

### Known Problems:
- The spray can is not attached correctly to the player's hand. You will need to adjust the values and find the perfect one.
  
### What can be done to improve the code:
- Create the spray particles from the spray can.
- Use virtual entities for sync.
- Make spray particles actually show at correct time.

## Information:
- This is not a drag and drop system. There are still changes that you have to make for this system to work for your server. This is more of a template / idea of how a graffiti system can be created.
- The graffiti is not synced between players. You will need to sync it on your own using Virtual Entities, which is super simple.
- Use `startspray <text> <size> <hex>` in console to draw a graffiti. Example: `startspray alt:V 60 #008736`
- This system was created using: [Typescript Boilerplate for alt:V](https://github.com/Stuyk/altv-typescript)

## Running the system:

```sh
npm install
```

```sh
npm run update
```

```sh
npm run dev
```

To close the server use: `CTRL + C` in the terminal.

### Contact:
- Discord: _dgx
