/**
 * TODO 根据具体业务逻辑修改
 */
(function() {
    var Common = {},
        $body = $("body");

    //获取登录的id
    Common.getId = function() {
        var auth = Cookie.get(Storage.AUTH);
        return auth;
    };


    //是否从APP跳转过来
    Common.isFromApp = function() {
        return "app" == Tools._GET().source;
    }

    //检查当前登录状态
    Common.checkLoginStatus = function(fn) {
        Common.init = fn;
        var userSn = Cookie.get("AccessToken");
        if (Tools.isWeChatBrowser() && !this.isFromApp()) {
            if (userSn) {
                Tools.alert("good token");
                //确保登录后在加载数据
                fn && fn();
            } else {
                WechatCommon.Login.autoLogin(function(data) {
                    Cookie.set("UserSN", data.memberId);
                    if(data.accessToken){
                        // 过滤会丢失token的登录请求
                        Cookie.set("AccessToken", data.accessToken);
                    }
                    Tools.alert("AccessToken: " + Cookie.get("AccessToken"));
                    location.href = Tools.removeParamFromUrl(["code"]);
                });
            }
        } else {
            Tools.alert('非微信浏览器');
            fn && fn();
        }
    }

    var onlyFirst = false; // 倒计时标志，确保只初始化一次

    /**
     * 自定义倒计时
     * @return {[type]} [description]
     */
    Common.initCountDown = function(serverTime, sel) {
        if (onlyFirst) {
            return;
        }
        onlyFirst = true;

        var tick = 0,
            serverTime = parseInt(serverTime);
        setInterval(function() {
            $(sel).each(function(i, d) {
                var endTime = $(this).attr('data-end');
                $(this).text(Tools.getRunTime(serverTime + tick, endTime));
            })
            tick++;
        }, 1000)
    }

    /**
     * 自定义延迟加载图片
     * @param  {[type]} sel 图片选择器
     * @return {[type]}
     */
    Common.lazyload = function(sel) {
        var dh = $(document).height(), //内容的高度
            wh = $(window).height(), //窗口的高度
            st = 0; //滚动的高度

        $(window).scroll(function() {
            st = $(window).scrollTop();
            init();
        })

        setTimeout(init, 200);

        function init() {
            $(sel).each(function(i, d) {
                var obj = $(this);
                if (obj.hasClass('loaded') || obj.attr('data-src') == '') return;
                var d = obj.offset(),
                    h = obj.height() + 8;
                if ((d.top + h) >= st && d.top < (st + wh * 2)) {
                    obj.attr('src', obj.attr('data-src')).addClass('loaded');
                }
            })
        }
    }

    /**
     * 自定义延迟加载图片 window无法滚动使用
     * @param  {[type]} sel 图片选择器  ele 滚动容器选择器 (必须有内层子元素)
     * @return {[type]}
     */
    Common.lazyloadforWindow = function(sel, ele) {
        var wh = $(window).height(), //窗口的高度
            st = 0,
            ele_obj = $(ele),
            ele_son_obj = ele_obj.children(); //滚动的高度
        ele_obj.scroll(function() {
            st = ele_obj.scrollTop();
            init();
        })
        setTimeout(init, 200);

        function init() {
            $(sel).each(function(i, d) {
                var obj = $(this);
                if (obj.hasClass('loaded') || obj.attr('data-src') == '') return;
                var d = obj.offset().top - ele_son_obj.offset().top,
                    h = obj.height() + 8;
                if ((d + h) >= st && d < (st + wh * 2)) {
                    obj.attr('src', obj.attr('data-src')).addClass('loaded');
                }
            })
        }
    }

    //点击加载下一页
    $(document).on('click', '.nextpage', function(response) {
        if ($(this).hasClass('disabled')) return;
        Config.PAGE++;
        Common.getList && Common.getList();
    })

    //滚动到底自动加载下一页
    $(window).scroll(function() {
        if ($('.nextpage').length == 0 || $('.nextpage').hasClass('disabled')) return;
        var currentHttpUrl = location.href;
        var goodsListPage = $('#goodsPage');
        if (goodsListPage && currentHttpUrl.indexOf('goods/goods-detail.html') > 0 && goodsListPage.css('display') == 'none') {
            Config.PAGE = Config.PAGE;
        } else {
            var st = $(window).scrollTop(),
                wh = $(window).height(), //窗口的高度
                d = $('.nextpage').offset();


            if (d.top < (st + wh * 3 / 2)) {
                Config.PAGE++;
                Common.getList && Common.getList();
                $('.nextpage').addClass("disabled")
            }
        }
    })

    //关闭参与活动界面
    function closeResult() {
        $('#tj-cover-bg').hide();
        $('.cover').hide();
    }

    $('.join-close').click(function(e) {
        closeResult();
    })

    $('#tj-cover-bg').click(function(e) {
        closeResult();
    })

    if (document.getElementById('tj-cover-bg')) {
        //取消遮罩层的默认滑动
        document.getElementById('tj-cover-bg').addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, true);
    }

    //回到顶部
    $('.back-top').click(function(e) {
        e.preventDefault();

        window.scrollTo(0, 0);
    });

    // 分享
    $('.footer-share').click(function() {
        if (Tools.isRbyAppBrowser()) {
            Jiao.toShare();
            return;
        }
        $('#tj-cover-bg').show();
        $('.dialog-con').show();
    })

    //记录上次的浏览位置
    Common.historyScorll = function() {
        var scrollTop
        window.onscroll = function() {
            scrollTop = $body.scrollTop();
            Storage.set(location.pathname, scrollTop)
        }
        return scrollTop
    }

    //滚动到上次的浏览位置
    Common.getHistoryScorll = function() {
        var scroll = Storage.get(location.pathname);
        if (!scroll) return;
        $body.scrollTop(scroll)
        Storage.remove(location.pathname)
    }

    if ('FastClick' in window)
        FastClick.attach(document.body);

    //微信中设置title属性
    Common.setWechatTitle = function(title) {
        var $body = $('body');
        document.title = title ? title : '';
        var $iframe = $('<iframe src="/favicon.ico" style="display:none;"></iframe>');
        $iframe.on('load', function() {
            setTimeout(function() {
                $iframe.off('load').remove();
            }, 0);
        }).appendTo($body);
    };

    // 获取分享链接
    Common.getShareLink = function(data) {
        var url = document.URL;

        // 分享商品详情还是优惠券
        if (data.type == 'detail') {
            url = Config.DETAIL_SHARE_LINK.replace('{ID}', data.id || '').replace('{CID}', data.couponId || '');
        } else if (data.type == 'coupon') {
            url = Config.COUPON_SHARE_LINK.replace('{ID}', data.id || '').replace('{CID}', data.couponId || '');
        }

        return url;
    }

    window.Common = Common;
})();

/**
 * 绑定上级用户，只要用户从上级用户分享的链接进入都会发送请求
 * @return
 */
(function() {
    var pid = Tools._GET().referId;
    if (pid) {
        sendData(pid);
    }

    /**
     * 发送请求
     * @param pid 上级用户ID
     * @return
     */
    function sendData(pid) {
        Ajax.custom({
            url: '/members/parent',
            data: {
                parentId: pid
            },
            type: 'POST',
            contentType: 'application/json'
        });
    }
})();
