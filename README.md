# bluesky-screencap-bot

Node.js script that pushes a screencap to a Bluesky social media account every hour, either randomly or in order.

This script is essentially a fork of Billy "Korjubzot" Walker's [bluesky-bot](https://github.com/Korjubzot/bluesky-bot), primarily modified to detect image dimensions properly, post images with filenames as alt text and enable chronological posting on special occasions.

It powers [Rocko Screens'](https://bsky.app/profile/did:plc:k6mevdoqphgshrmqowshhvgn) Bluesky account since its launch on February 2025.

> For starters, **Rocko Screens** is a passion project of mine that I started back in January 2019 on Twitter, with a Bluesky account being launched 6 years after, in February 2025. Since then, it has grown to **over 13K followers on X** *(formerly Twitter)* alone as I'm writing this, and is still very active on both platforms.
> 
> To celebrate Rocko Screens' **1000 followers on Bluesky**, I've decided to release some enhancements by yours truly to some code found on GitHub, made just to make sure it meets **all** the needs for maintaining my project on that platform.
> 
> Feel free to use this code on your own projects, perhaps even the likes of Rocko Screens and such! _– I.M._

## Getting Started

These instructions will walk you through running this script on your local machine for development and testing purposes.

### Requirements

- Node.js
- npm
- A [Bluesky](https://bsky.app/) account

### Installation

1. Clone the repository to your local.
```
git clone https://github.com/MitenkovIvan/bluesky-screencap-bot
```

2. Navigate to project directory.
```
cd bluesky-screencap-bot
```

3. Install dependencies.
```
npm install
```

4. Create a ```.env``` file in your root directory and add your Bluesky credentials.
```
IDENTIFIER=your_identifier
PASSWORD=your_password
```
Identifier should be your Bluesky username, without the @ symbol attached (i.e. screencapbot.bsky.social). Your password _can_ be your account password, but Bluesky recommends using App Passwords for security. You can generate one under Settings > Advanced > App Passwords.

5. Create a ```.env.local``` file in the same directory and add the following into it. This is important for switching between random and chronological orders (more on that below).
```
MODE=normal
```

6. Add images to the ```/img``` and ```/img_alt``` directories.

Bluesky currently supports just .png and .jpg file formats, and this bot requires a minimum of two images in at least one of these folders to operate properly.

### Usage

Run ```node index.js``` to run this script a single time. There are two modes available: normal and special.

In normal mode, the bot first logs in to Bluesky using your credentials, then selects a random image from the ```/img``` folder. If that image's filename doesn't exist in ```usedImages.json```, it's valid to post - otherwise, it looks for a new image.

Posting on Bluesky requires uploading the image as a Blob (```agent.uploadBlob```) and then pairing that blob with a regular post request (```agent.post```). The script sends that post with that image's filename as the alt text. Bluesky logins through their API only last a few minutes before automatically logging out, so there's no need for a logout function.

When the maximum number of images is reached (i.e. ```usedImages``` has the filenames of every image in the folder), the bot will quietly reset the folder and continue on as normal.

In special mode, it's pretty much the same, except it instead selects and posts images in order from the ```/img_alt``` folder and used images are saved in ```usedImages_alt.json```.

#### Why special mode exists?

Let's assume there's a good occasion for switching to posting special screencaps in order for a while, like reaching a certain number of subscribers. ;)

Special mode was programmed with such occasions in mind and is turned off automatically upon posting all special screencaps and resetting ```usedImages_alt.json```, allowing to instantly move on to posting usual screencaps randomly.

### Automating

The easiest way to use this bot for yourself is with GitHub Actions, albeit this _doesn't_ support special mode.

1. Fork the repository to your own GitHub.
2. Go to repo settings.
3. Navigate to Security > Secrets and Variables > Actions.
4. Add two new Repository Secrets - one for your handle, and one for your password. They'll be the same as your ```IDENTIFIER``` and ```PASSWORD``` credentials above. Make sure to name them as IDENTIFIER and PASSWORD.
5. Inside the ```.github/workflows``` directory is a file called ```post.yml``` that GitHub Actions uses to run this script. Copy and paste the following into it.
```
name: "Post a screencap on Bluesky"

on:
  schedule: 
    - cron: "0 * * * *"

jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version-file: ".nvmrc"
      - run: npm ci
      - name: Send post
        run: node index.js
        env:
          IDENTIFIER: ${{ secrets.IDENTIFIER }}
          PASSWORD: ${{ secrets.PASSWORD }}
```
This is the default setting - once at the beginning of every hour, like at 11:00am, then at 12:00pm, etc. You can use [crontab](https://crontab.guru/) to play around with the timing until you feel happy with it. It uses the latest version of Ubuntu to run Node.js (the version of Node.js is specified in ```.nvmrc```).

### Known Issues

- Bluesky appears to have some minor bugs relating to image size limit and may be incorrectly calculating image sizes after compression, preventing posting under certain circumstances.

### To Do

- Improve error handling.
- Parameterize host URL, improve format checking logic.
- General code clean up.

### Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

Just for the record, the example images provided in both folders are not the actual screencaps. These are only named as such to demonstrate how the alt text works.

### One Last Thing

> Thank you for following Rocko Screens, no matter the platform *(Bluesky or X)*!

_– Ivan "hexoid03" Mitenkov, since 2019_
