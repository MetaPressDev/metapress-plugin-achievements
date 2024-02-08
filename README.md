# Achievements Plugin :medal_sports:

Allows users to earn achievements for completing various activities inside various worlds.

## :hammer: Installation

You can install the achievements plugin the same way you install any plugin into your WordPress website.

Before adding the plugin to your WordPress website, you need to build the plugin. You can do this by running the
```
npm run build
```
command from the root of this repository.

Once the plugin has been built, you should see a `dist` folder and a file `metapress_achievements.zip` inside the folder.

To install the plugin into your WordPress website, you can do the following:
1. On your WordPress dashboard (usually `/wp-admin`), click "Plugins" in the left sidebar
2. Click the "Add New Plugin" button at the top of the page
3. Click the "Upload Plugin" button at the top of the page
4. Choose the `metapress_achievements.zip` file that was generated earlier
5. Click the "Install Now" button
6. Click the "Activate" button

All set! :tada:

## :page_with_curl: Register Achievement

To register an achievement, you need to listen for the event `achievements_register`, which can be done in two ways:
1. `metapress.plugins.addEventListener('achievements_register', () => { return ... })`
2. `$achievements_register() { return ... }`

**Note**: All monitoring and updating of the achievement should be done by whatever is registering the plugin. A method `update` is provided when registering an achievement, which can be used to update the progress of the achievement.

Format of the achievement registration is the following:
```js
{
  id: string,               // Required. Identifier for the achievement.
  names: string[],          // Required. List of achievement names for each achievement level.
  descriptions: string[],   // Required. List of descrptions for each achievement level.
  thresholds: number[],     // Required. List of the maximum value for each level, such that the progress is between [0, threshold) for each level.
  images: string[],         // Required. List of images (or URLs) for each level.
  start: update => {},      // Required. Called when monitoring of the achievement should start. `update` is a method with parameters `id: string, progress: number`.
  stop?: () => {},          // Optional. Called when monitoring of the achievement should stop.
  level?: number,           // Optional. Level to start the achievement at.
  progress?: number         // Optional. Progress to start the achievement at.
}
```

An example of an achievement can be seen below:
```js
$achievements_register() {
  return {
    id: 'simple-achievement',
    names: [ 'Hello', 'Hello World!' ],
    descriptions: [ 'Wait 5 seconds.', 'Wait 10 seconds.' ],
    thresholds: [ 5_000, 10_000 ],
    images: [ 'https://www.some-image.com/1.png', 'https://www.some-image.com/2.png' ],
    start: update => {
      this.interval = setInterval(() => update('simple-achievement', 500)), 500)
    },
    stop: () => {
      if (this.interval) clearInterval(this.interval)
    },
  }
}
```
