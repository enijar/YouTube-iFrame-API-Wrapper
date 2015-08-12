# YouTube iFrame API Wrapper
A convenient way to add custom functionality and styles to YouTube's video player using the iFrame API 
provided by YouTube.

> ***Warning*** Bug in IE9. Player carrys on playing after the preload play/pause/seek cycle.

### Basic Usage

Add the template wherever you want the video to appear on your page, padding in the video id wherever it 
is needed. This example used a YouTube video id of `ShUyfk4QB-8`.

```html
<div class="video-container" id="ShUyfk4QB-8">
    <div class="embed-responsive embed-responsive-16by9">
        <div class="embed-responsive-item">

            <div class="mask"></div>
            <img src="assets/img/preload.gif" class="preload">

            <div class="play">
                <i class="play-icon glyphicon glyphicon-play-circle"></i>
            </div>

            <div class="mute">
                <i class="mute-icon notMuted glyphicon glyphicon-volume-up"></i>
                <i class="mute-icon isMuted glyphicon glyphicon-volume-off"></i>
            </div>

            <img class="thumb" src="http://img.youtube.com/vi/ShUyfk4QB-8/maxresdefault.jpg">
            <div class="iframe" id="video-ShUyfk4QB-8"></div>

        </div>
    </div>

    <div class="progress">
        <div class="progress-bar" role="progressbar"></div>
    </div>
</div>
```

Include YouTube's iFrame API and the Player class.

```html
<script src="//www.youtube.com/iframe_api"></script>
<script src="path/to/Player.js"></script>
```

Add the onYouTubeIframeAPIReady that the iFrame API will call when it's loaded. Then instantiate the 
Player class and call the init method, passing in the YouTube video id and any method callbacks you want 
(See Method Callbacks section for more information).

```js
function onYouTubeIframeAPIReady() {
    (new Player).init({id: 'ShUyfk4QB-8'});
}
```

### Method Callbacks

There are 10 method callbacks that will get called on specific events. You can use these to hoot into 
these events and execute your own code.

```js
(new Player).init({
    id: 'ShUyfk4QB-8',
    onLoaded: function(player) {},
    onPlay: function(player) {},
    onPlaying: function(player) {},
    onPause: function(player) {},
    onMute: function(player) {},
    onUnMute: function(player) {},
    onEnd: function(player) {},
    onSeekStart: function(player) {},
    onSeeking: function(player) {},
    onSeekEnd: function(player) {}
});
```

Here is an example. When the video is played, after 5 seconds the video is paused and the current time 
is alerted.

```js
(new Player).init({
    id: 'ShUyfk4QB-8',
    onPlay: function(player) {
        setTimeout(function() {
            player.pause();
            alert(player.time());
        }, 5000);
    }
});
```

### Example Player Theme

![Holding Screen](https://i.imgur.com/XXHTUPd.png)

![Playing Screen](https://i.imgur.com/smNlLwe.png)