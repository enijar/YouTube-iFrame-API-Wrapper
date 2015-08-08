var Player = function () {
    var that = this;

    this.loaded = false;
    this.done = false;
    this.seeking = false;
    this.reset = false;
    this.playerProgressBarInterval = undefined;
    this.elements = {};

    this.options = {
        fps: 24,
        quality: 'hd720',
        parameters: {
            hd: 1,
            controls: 0,
            showinfo: 0,
            autohide: 1,
            modestbranding: 1,
            iv_load_policy: 3,
            rel: 0,
            disablekb: 1,
            origin: 'http://james.local'
        }
    };

    this.init = function (options) {
        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                that.options[option] = options[option];
            }
        }

        getElements();
        preLoad();
    };

    this.play = function () {
        if (that.loaded && (that.playerState === 2 || that.playerState === -1)) {
            that.video.play();
            toggle(that.elements.play).hide();
            toggle(that.elements.thumb).hide();
        }
    };

    this.pause = function () {
        if (that.loaded && that.playerState === 1) {
            that.video.pause();
            toggle(that.elements.play).show();
        }
    };

    this.video = {
        play: function() {
            return that.player['playVideo']();
        },
        pause: function() {
            return that.player['pauseVideo']();
        },
        mute: function() {
            return that.player['mute']();
        },
        unMute: function() {
            return that.player['unMute']();
        },
        seek: function(time) {
            return that.player['seekTo'](time);
        },
        quality: function(quality) {
            return that.player['setPlaybackQuality'](quality);
        },
        duration: function() {
            return that.player['getDuration']();
        },
        currentTime: function() {
            return that.player['getCurrentTime']();
        }
    };

    this.onPlayerReady = function (e) {
        events();

        that.video.quality(that.options.quality);
        that.video.mute();
        that.video.play();
    };

    this.onPlayerStateChange = function (e) {
        that.playerState = e.data;

        if (that.playerState === 3 && !that.loaded) {
            that.loaded = true;
            that.seeking = false;

            setTimeout(function () {
                that.video.pause();
                that.video.seek(0);
                that.video.unMute();
            }, 350);
        }

        if (that.playerState === 1) {
            updateProgressBar();

            if (that.reset) {
                that.reset = false;
            }

            if (!that.reset) {
                toggle(that.elements.play).hide();
                toggle(that.elements.progress).show();
            }
        }

        if (that.playerState === 2) {
            if (!that.seeking) {
                toggle(that.elements.play).show();

                if (!that.reset) {
                    toggle(that.elements.progress).show();
                }
            }
        }

        if (that.playerState === 0) {
            that.reset = true;

            clearInterval(that.playerProgressBarInterval);
            toggle(that.elements.thumb).show();
            toggle(that.elements.play).show();
            toggle(that.elements.progress).hide();

            that.video.pause();
            that.video.seek(0);
            that.elements.progressBar.css({width: '100%'});
        }

        console.log(that.playerState);
    };

    this.toggleState = function (e) {
        if (that.loaded) {
            if (that.playerState === 1) {
                that.pause();
            } else {
                that.play();
            }
        }
    };

    this.changeVideoTime = function (e) {
        if (that.loaded && (that.video.duration() !== that.video.currentTime())) {
            that.seeking = true;

            var percentage = (100 / $(this).closest('.progress').width()) * (e.pageX - $(this).parent().offset().left);
            var time = (that.player.getDuration() / 100) * percentage;

            that.player.seekTo(time);
            that.elements.progressBar.css({width: percentage + '%'});
        }
    };

    var updateProgressBar = function () {
        that.playerProgressBarInterval = setInterval(function () {
            var percentage = ((100 / that.video.duration()) * that.video.currentTime());
            that.elements.progressBar.css({width: percentage + '%'});
        }, (1000 / that.options.fps));
    };

    var preLoad = function () {
        that.elements.iframe.show();

        var thumb = new Image;
        thumb.src = 'http://img.youtube.com/vi/' + that.options.id + '/maxresdefault.jpg';
        thumb.onload = function () {
            that.elements.preload.hide();
            toggle(that.elements.thumb).show();
            toggle(that.elements.play).show();

            that.player = new YT.Player('video-' + that.options.id, {
                videoId: that.options.id,
                playerVars: that.options.parameters,
                events: {
                    onReady: that.onPlayerReady,
                    onStateChange: that.onPlayerStateChange
                }
            });
        };
    };

    var toggle = function (element) {
        return {
            hide: function () {
                element.hide();
            },
            show: function () {
                element.show();
            }
        };
    };

    var getElements = function () {
        that.elements.player        = that.options.player       || $('#' + that.options.id);
        that.elements.mask          = that.options.mask         || that.elements.player.find('.mask');
        that.elements.play          = that.options.play         || that.elements.player.find('.play');
        that.elements.thumb         = that.options.thumb        || that.elements.player.find('.thumb');
        that.elements.iframe        = that.options.iframe       || that.elements.player.find('.iframe');
        that.elements.preload       = that.options.preload      || that.elements.player.find('.preload');
        that.elements.progress      = that.options.progress     || that.elements.player.find('.progress');
        that.elements.progressBar   = that.options.progressBar  || that.elements.player.find('.progress-bar');
    };

    var events = function () {
        that.elements.mask.on('click', that.toggleState);
        that.elements.progress.on('click', that.changeVideoTime);
    };
};