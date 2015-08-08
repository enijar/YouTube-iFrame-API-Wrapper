var Player = function () {

    // TODO: Add mute button.
    // TODO: Add quality control (480p, 720p, etc.).
    // TODO: Add user callbacks.
    // TODO: Add second progress bar to show buffered amount.
    // TODO: Research why "Untrusted origin: chrome-extension://..." warning is logged. (Google Chrome Cast?)

    const UNSTARTED = -1;
    const ENDED = 0;
    const PLAYING = 1;
    const PAUSED = 2;
    const BUFFERING = 3;
    const CUED = 5;

    var that = this;

    this.loaded = false;
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

        setElements();
        loadVideo();
    };

    this.video = {
        state: UNSTARTED,
        play: function () {
            return that.player['playVideo']();
        },
        pause: function () {
            return that.player['pauseVideo']();
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
        }
    };

    this.play = function () {
        if (that.loaded && (that.video.state === PAUSED || that.video.state === UNSTARTED || that.seeking)) {
            that.video.play();
            toggle(that.elements.play).hide();
            toggle(that.elements.thumb).hide();
        }
    };

    this.pause = function () {
        if (that.loaded && that.video.state === PLAYING) {
            clearInterval(that.playerProgressBarInterval);
            that.video.pause();
            toggle(that.elements.play).show();
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

            if (!that.reset) {
                toggle(that.elements.play).hide();
                toggle(that.elements.progress).show();
            }

            updateProgressBar();
        }

        if (that.video.state === PAUSED) {
            if (!that.seeking) {
                toggle(that.elements.play).show();

                if (!that.reset) {
                    toggle(that.elements.progress).show();
                }
            }
        }

        if (that.video.state === ENDED) {
            that.reset = true;

            clearInterval(that.playerProgressBarInterval);
            toggle(that.elements.thumb).show();
            toggle(that.elements.play).show();
            toggle(that.elements.progress).hide();

            that.video.pause();
            that.video.seek(0);
            that.elements.progressBar.style.width = '100%';
        }
    };

    this.toggleState = function () {
        if (that.loaded) {
            if (that.video.state === PLAYING) {
                removeClass(this.parentNode, 'playing');
                that.pause();
            } else {
                addClass(this.parentNode, 'playing');
                that.play();
            }
        }
    };

    this.changeVideoTime = function (e) {
        clearInterval(that.playerProgressBarInterval);

        if (e.type === 'mousedown') {
            that.seeking = true;
            that.pause();
            moveProgressBar(e);
        }

        if (e.type === 'mouseup' || e.type === 'mouseleave') {
            if(that.seeking) {
                that.play();
                that.seeking = false;
            }
        }

        if (e.type === 'mousemove' && that.seeking) {
            clearInterval(that.playerProgressBarInterval);
            moveProgressBar(e);
        }
    };

    var toggleClass = function (element, className) {
        if(element.classList.contains(className)) {
            element.classList.remove(className);
        } else {
            element.classList.add(className);
        }
    };

    var addClass = function (element, className) {
        element.classList.add(className);
    };

    var removeClass = function (element, className) {
        element.className = element.className.split(className).join('');
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
            }
        }, (1000 / that.options.fps));
    };

    var loadVideo = function () {
        toggle(that.elements.iframe).show();

        var thumb = new Image;
        thumb.src = 'http://img.youtube.com/vi/' + that.options.id + '/maxresdefault.jpg';
        thumb.onerror = loadPlayer;
        thumb.onload = loadPlayer;
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

    var loadPlayer = function () {
        toggle(that.elements.preload).hide();
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

    var setElements = function () {
        that.elements.mask = that.options.mask || document.querySelector('#' + that.options.id + ' .mask');
        that.elements.play = that.options.play || document.querySelector('#' + that.options.id + ' .play');
        that.elements.thumb = that.options.thumb || document.querySelector('#' + that.options.id + ' .thumb');
        that.elements.iframe = that.options.iframe || document.querySelector('#' + that.options.id + ' .iframe');
        that.elements.preload = that.options.preload || document.querySelector('#' + that.options.id + ' .preload');
        that.elements.progress = that.options.progress || document.querySelector('#' + that.options.id + ' .progress');
        that.elements.progressBar = that.options.progressBar || document.querySelector('#' + that.options.id + ' .progress-bar');
    };

    var events = function () {
        that.elements.mask.addEventListener('click', that.toggleState);
        that.elements.play.addEventListener('click', that.toggleState);
        that.elements.progress.addEventListener('mousedown', that.changeVideoTime);
        that.elements.progress.addEventListener('mousemove', that.changeVideoTime);
        that.elements.progress.addEventListener('mouseleave', that.changeVideoTime);
        that.elements.progress.addEventListener('mouseup', that.changeVideoTime);
    };

};