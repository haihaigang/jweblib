/**
 * 自定义弹出页，依赖jquery
 */
(function(window) {
    var tempPage = 0; //打开页面的计数，
    var SecondPage = function(options) {
        var that = this;

        if (typeof options == 'object') {
            for (var i in options) {
                that[i] = options[i];
            }
        } else if (typeof options == 'string') {
            that.targetPage = $(options);
        }
        that.coverDom = that.coverDom || $('#sidebar-bg');

        //默认点击遮罩层关闭
        that.coverDom.click(function(e) {
            e.preventDefault();
            that.closeSidebar();
        });

        if (that.coverDom.length > 0) {
            that.coverDom[0].addEventListener('touchmove', prevent, true);
        }

        if (that.targetPage.length > 0) {
            that.targetPage[0].addEventListener('touchmove', function(e){
                // e.stopPropagation();
                // e.preventDefault();
            }, false);
        }
    }

    SecondPage.prototype = {
        targetPage: undefined, //当前页面DOM
        coverDom: undefined, //遮罩层
        beforeOpen: function() {}, //打开之前
        afterClose: function() {}, //关闭之后
        openSidebar: function(fn) {
            var container = $(window),
                w = container.width(),
                h = container.height(),
                clientH = this.targetPage.height(),
                that = this;

            that.coverDom.show();
            that.targetPage.show()
                .css({
                    // 'width': w
                        // 'height': h
                });

            setTimeout(function() {
                that.targetPage.addClass('open');
            }, 100)
            tempPage++;

            if (!$('body').hasClass('move')) {
                $('body').addClass('move')
                    .css({
                        'width': document.documentElement.clientWidth,
                        'height': document.documentElement.clientHeight,
                        'overflow': 'hidden'
                    });
            }

            fn && fn();
            that.beforeOpen && that.beforeOpen();
        },

        closeSidebar: function(fn) {
            var that = this;
            this.targetPage.removeClass('open');
            tempPage--;
            setTimeout(function() {
                that.coverDom.hide();
                that.targetPage.hide();
                hasOpend = false;
                if (tempPage <= 0) {
                    $('body').removeClass('move')
                        .css({
                            'width': 'auto',
                            'height': 'auto',
                            'overflow': 'inherit'
                        });
                }
                fn && fn();
                that.afterClose && that.afterClose();
            }, 220);
        }
    }


    function prevent(e) {
        e.preventDefault();
    }

    window.SecondPage = SecondPage;
})(window)
