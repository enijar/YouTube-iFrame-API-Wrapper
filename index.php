<?php

$video = new StdClass;
$video->id = 'ShUyfk4QB-8';

?>
<!DOCTYPE html>

<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="author" content="">
        <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">

        <title>Frontline YouTube Player</title>
        <link rel="stylesheet" href="assets/css/main.css">
    </head>

    <body>
        <div class="video-container" id="<?php echo $video->id; ?>">
            <div class="embed-responsive embed-responsive-16by9">
                <div class="embed-responsive-item">

                    <div class="mask"></div>
                    <img src="assets/img/preload.gif" class="preload">
                    <div class="play">
                        <i class="play-icon glyphicon glyphicon-play-circle"></i>
                    </div>
                    <img class="thumb" src="http://img.youtube.com/vi/<?php echo $video->id; ?>/maxresdefault.jpg">
                    <div class="iframe" id="video-<?php echo $video->id; ?>"></div>

                </div>
            </div>

            <div class="progress">
                <div class="progress-bar" role="progressbar"></div>
            </div>
        </div>

        <script src="//www.youtube.com/iframe_api"></script>
        <script src="assets/js/vendor/jquery.min.js"></script>
        <script src="assets/js/components/Player.js"></script>

        <script>
            function onYouTubeIframeAPIReady() {
                (new Player).init({id: '<?php echo $video->id; ?>'});
            }
        </script>
    </body>
</html>