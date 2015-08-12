var Player = function () {

    // TODO: Research why "Untrusted origin: chrome-extension://..." warning is logged. (Google Chrome Cast?)
    // TODO: Add quality control (480p, 720p, etc.).

    var UNSTARTED = -1;
    var ENDED = 0;
    var PLAYING = 1;
    var PAUSED = 2;
    var BUFFERING = 3;
    var CUED = 5;

    var that = this;

    this.loaded = false;
    this.seeking = false;
    this.reset = false;
    this.playerProgressBarInterval = undefined;
    this.elements = {};
    this.callbackObject = {};

    this.options = {
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
            html5: 1
        }
    };

    this.init = function (options) {
        for (var option in options) {
            if (options.hasOwnProperty(option)) {
                that.options[option] = options[option];
            }
        }

        setElements();
        loadVideo();

        that.callbackObject = {
            play: that.play,
            pause: that.pause,
            time: that.video.currentTime,
            buffer: that.video.buffer,
            thumb: that.elements.thumb,
            iframe: that.elements.iframe,
            preload: that.elements.preload,
            progress: that.elements.progress,
            progressBar: that.elements.progressBar,
            playButton: that.elements.play,
            soundButton: that.elements.sound
        };
    };

    this.video = {
        state: UNSTARTED,
        play: function () {
            return that.player['playVideo']();
        },
        pause: function () {
            return that.player['pauseVideo']();
        },
        isMuted: function () {
            return that.player['isMuted']();
        },
        mute: function () {
            return that.player['mute']();
        },
        unMute: function () {
            return that.player['unMute']();
        },
        seek: function (time) {
            return that.player['seekTo'](time);
        },
        quality: function (quality) {
            return that.player['setPlaybackQuality'](quality);
        },
        duration: function () {
            return that.player['getDuration']();
        },
        currentTime: function () {
            return that.player['getCurrentTime']();
        },
        buffer: function() {
            return that.player['getVideoLoadedFraction']();
        }
    };

    this.play = function () {
        if (that.loaded && (that.video.state === PAUSED || that.video.state === UNSTARTED || that.seeking)) {
            removeClass(that.elements.mask.parentNode, 'paused');
            addClass(that.elements.mask.parentNode, 'playing');
            toggle(that.elements.thumb).hide();
            that.video.play();
            updateProgressBar();

            if(that.options['onPlay']) {
                that.options['onPlay'](that.callbackObject);
            }
        }
    };

    this.pause = function () {
        if (that.loaded && that.video.state === PLAYING) {
            that.video.pause();
            clearInterval(that.playerProgressBarInterval);

            if(that.options['onPause']) {
                that.options['onPause'](that.callbackObject);
            }

            removeClass(that.elements.mask.parentNode, 'playing');
            addClass(that.elements.mask.parentNode, 'paused');
        }
    };

    this.onPlayerReady = function () {
        events();

        that.video.quality(that.options.quality);
        that.video.mute();
        that.video.play();
    };

    this.onPlayerStateChange = function (e) {
        that.video.state = e.data;

        if (that.video.state === BUFFERING && !that.loaded) {
            that.loaded = true;
            that.seeking = false;

            if(that.options['onLoaded']) {
                that.options['onLoaded'](that.callbackObject);
            }

            setTimeout(function () {
                that.video.pause();
                that.video.seek(0);
                that.video.unMute();
            }, 350);
        }

        if (that.video.state === PLAYING) {
            if (that.reset) {
                that.reset = false;
            }

            updateProgressBar();
        }

        if (that.video.state === ENDED) {
            that.reset = true;

            toggle(that.elements.thumb).show();

            that.video.pause();
            that.video.seek(0);
            clearInterval(that.playerProgressBarInterval);

            if(that.options['onEnd']) {
                that.options['onEnd'](that.callbackObject);
            }

            that.elements.progressBar.style.width = '100%';
        }
    };

    this.toggleState = function () {
        if (that.loaded) {
            if (that.video.state === PLAYING) {
                that.pause();
            } else {
                that.play();
            }
        }
    };

    this.toggleSound = function () {
        if (that.loaded) {
            if (that.video.isMuted()) {
                that.video.unMute();

                if(that.options['onUnMute']) {
                    that.options['onUnMute'](that.callbackObject);
                }

                removeClass(that.elements.mask.parentNode, 'muted');
            } else {
                that.video.mute();

                if(that.options['onMute']) {
                    that.options['onMute'](that.callbackObject);
                }

                addClass(that.elements.mask.parentNode, 'muted');
            }
        }
    };

    this.changeVideoTime = function (e) {
        clearInterval(that.playerProgressBarInterval);

        if (e.type === 'mousedown') {
            that.seeking = true;

            if(that.options['onSeekStart']) {
                that.options['onSeekStart'](that.callbackObject);
            }

            that.pause();
            moveProgressBar(e);
        }

        if (e.type === 'mouseup' || e.type === 'mouseleave') {
            if (that.seeking) {
                if(that.options['onSeekEnd']) {
                    that.options['onSeekEnd'](that.callbackObject);
                }

                that.play();
                that.seeking = false;
            }
        }

        if (e.type === 'mousemove' && that.seeking) {
            moveProgressBar(e);

            if(that.options['onSeeking']) {
                that.options['onSeeking'](that.callbackObject);
            }
        }
    };

    var moveProgressBar = function (e) {
        if (that.loaded && (that.video.duration() !== that.video.currentTime())) {
            var offsetLeft = e.clientX - that.elements.progress.getBoundingClientRect().left;
            var percentage = (100 / that.elements.progress.offsetWidth) * offsetLeft;
            var time = (that.video.duration() / 100) * percentage;

            that.video.seek(time);
            that.elements.progressBar.style.width = percentage + '%';
        }
    };

    var updateProgressBar = function () {
        that.playerProgressBarInterval = setInterval(function () {
            if (!that.seeking && that.video.state === PLAYING) {
                var percentage = ((100 / that.video.duration()) * that.video.currentTime());
                that.elements.progressBar.style.width = percentage + '%';
                that.elements.bufferBar.style.width = (that.video.buffer()*100) + '%';

                if(that.options['onPlaying']) {
                    that.options['onPlaying'](that.callbackObject);
                }
            }
        }, 1000);
    };

    var loadVideo = function () {
        toggle(that.elements.iframe).show();

        var thumb = new Image;
        thumb.src = 'http://img.youtube.com/vi/' + that.options.id + '/maxresdefault.jpg';
        thumb.onerror = loadPlayer;
        thumb.onload = loadPlayer;
    };

    var loadPlayer = function () {
        toggle(that.elements.thumb).show();

        that.player = new YT.Player('video-' + that.options.id, {
            videoId: that.options.id,
            playerVars: that.options.parameters,
            events: {
                onReady: that.onPlayerReady,
                onStateChange: that.onPlayerStateChange
            }
        });
    };

    var toggleClass = function (element, className) {
        if (element.classList.contains ? element.classList.contains(className) : element.className.match(new RegExp('\\b' + className + '\\b')) !== null) {
            element.classList.remove ? element.classList.remove(className) : element.className.split(className).join('');
        } else {
            element.classList.add ? element.classList.add(className) : element.className += ' ' + className;
        }
    };

    var addClass = function (element, className) {
        element.classList.add ? element.classList.add(className) : element.className += ' ' + className;
    };

    var removeClass = function (element, className) {
        element.classList.remove ? element.classList.remove(className) : element.className.split(className).join('');
    };

    var toggle = function (element) {
        return {
            hide: function () {
                element.style.display = 'none';
            },
            show: function () {
                element.style.display = 'block';
            }
        };
    };

    var setElements = function () {
        that.elements.mask = that.options.mask || document.querySelector('#' + that.options.id + ' .mask');
        that.elements.play = that.options.play || document.querySelector('#' + that.options.id + ' .play');
        that.elements.sound = that.options.sound || document.querySelector('#' + that.options.id + ' .sound');
        that.elements.thumb = that.options.thumb || document.querySelector('#' + that.options.id + ' .thumb');
        that.elements.iframe = that.options.iframe || document.querySelector('#' + that.options.id + ' .iframe');
        that.elements.preload = that.options.preload || document.querySelector('#' + that.options.id + ' .preload');
        that.elements.progress = that.options.progress || document.querySelector('#' + that.options.id + ' .progress');
        that.elements.bufferBar = that.options.bufferBar || document.querySelector('#' + that.options.id + ' .buffer-bar');
        that.elements.progressBar = that.options.progressBar || document.querySelector('#' + that.options.id + ' .progress-bar');
    };

    var addEvent = function(element, event, callback) {
        if(element.addEventListener) {
            element.addEventListener(event, callback);
        } else {
            element.attachEvent(event, callback);
        }
    };

    var events = function () {
        addEvent(that.elements.mask, 'click', that.toggleState);
        addEvent(that.elements.play, 'click', that.toggleState);
        addEvent(that.elements.sound, 'click', that.toggleSound);
        addEvent(that.elements.progress, 'mousedown', that.changeVideoTime);
        addEvent(that.elements.progress, 'mousemove', that.changeVideoTime);
        addEvent(that.elements.progress, 'mouseleave', that.changeVideoTime);
        addEvent(that.elements.progress, 'mouseup', that.changeVideoTime);
    };

};