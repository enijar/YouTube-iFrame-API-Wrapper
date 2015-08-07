# YouTube iFrame API Wrapper
A convenient way to add custom functionality and styles to YouTube's video player using the iFrame API 
provided by YouTube.

> *Warning* Still in development. Please report any bugs or issues.

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
            <img class="thumb" src="http://img.youtube.com/vi/ShUyfk4QB-8/maxresdefault.jpg">
            <div class="iframe" id="video-ShUyfk4QB-8"></div>

        </div>
    </div>

    <div class="progress">
        <div class="progress-bar" role="progressbar"></div>
    </div>
</div>
```

Include YouTube's iFrame API.

```html
<script src="//www.youtube.com/iframe_api"></script>
```

Add the onYouTubeIframeAPIReady that the iFrame API will call when it's loaded. Then instantiate the 
Player class and call the init method, passing in the YouTube video id.

```js
function onYouTubeIframeAPIReady() {
    (new Player).init({id: 'ShUyfk4QB-8'});
}
```
