/**
 * 与native交互
 **/

(function() {
    var jiao = {
        sep: ':', //协议分隔符
        // 通知iPhone UIWebView 加载url对应的资源
        loadURL: function(type, param) {
            var url = type + this.sep + param;
            var iFrame;
            iFrame = document.createElement("iframe");
            iFrame.setAttribute("src", url);
            iFrame.setAttribute("style", "display:none;");
            iFrame.setAttribute("height", "0px");
            iFrame.setAttribute("width", "0px");
            iFrame.setAttribute("frameborder", "0");
            document.body.appendChild(iFrame);
            iFrame.parentNode.removeChild(iFrame);
            iFrame = null;
            return url;
        },
        inte: undefined
    };

    //通知app，当前已退出
    jiao.noticeIsLogout = function() {
        return this.loadURL('logout', '1');
    };

    //通知app，跳转订单
    jiao.toOrder = function(v) {
        return this.loadURL('order', v);
    };

    //通知app，打开支付
    jiao.toPay = function(v) {
        return this.loadURL('pay', v);
    };

    //通知app，打开分类页
    jiao.toCategory = function(v) {
        return this.loadURL('category', v || 1);
    };

    //通知app，打开首页
    jiao.toHome = function(v) {
        return this.loadURL('home', v || 1);
    };

    //通知app，打开专题团
    jiao.toGroup = function(v) {
        return this.loadURL('group', v || 1);
    };
    //通知app，打开购物车
    jiao.toCart = function(v) {
        return this.loadURL('openCart', v || 1);
    };

    // 通知app发起分享
    //share:{"shareTitle":"","shareDesc":"","sharePic":"","shareLink":""}
    jiao.toShare = function() {
        var res = '{}';
        if (this.shareData && typeof 'JSON' != 'undefined') {
            res = JSON.stringify(this.shareData);
        }
        return this.loadURL('share', res);
    };

    //提供给app中获取分享数据 目前app不支持主动调用获取返回js
    jiao.getShareData = function() {
        return this.shareData;
    };

    //提供给app调用设置头信息，参数{"rudder_market":"","rudder_appSystem":""}
    jiao.setHeader = function(headerJson) {
        // alert('abc==>' + headerJson);
        var data = {};
        try {
            data = JSON.parse(headerJson);
            Storage.set('AppHeader', data);
        } catch (e) {}
        return data;
    };

    //提供给app调用，打开微信支付再取消后调用该方法
    jiao.cancelPay = function() {
        // alert('还原支付按钮');
        $('.btn-pay').text('立即支付').removeClass('disabled'); //还原支付按钮
    };

    //提供给android调用，在登录后调用，初始化微官网用户状态（修复android中登录不能同步bug）
    jiao.init = function(key, token) {
        // alert('初始化成功');
        if (key) {
            Cookie.set('UserSN', key);
        }
        if (token) {
            Cookie.set('RBYAIRID', token);
        }
        Cookie.set('IsBind', 1);
    };

    //通知app，展示购物车动画，v=商品的图片
    jiao.noticeCart = function(v) {
        this.loadURL('cart', v);
    }

    //通知app，打开商品详情，v=productId goods:10201
    jiao.toGoods = function(v) {
        if (this.inte) {
            clearInterval(this.inte);
        }
        //试图获取坑位信息，轮询获取直到成功，最多10次
        var position = Cookie.get('MeiPosition') || '',
            count = 0;

        function getParam() {
            var position = Cookie.get('MeiPosition') || '',
                rudderPageId = Cookie.get('RudderPageId') || ''
            return v += ',' + position + ',' + rudderPageId;
        }

        if (position) {
            return this.loadURL('goods', getParam());
        } else {
            this.inte = setInterval(function() {
                if (position || count > 10) {
                    clearInterval(this.inte);
                    return this.loadURL('goods', getParam());
                }
                count++;
            }.bind(this), 50);
        }
    };

    //通知app，返回上一级
    jiao.toBack = function() {
        return this.loadURL('back', 1);
    };

    //通知app，跳转到订单列表,v(0,1,2,3,4)
    jiao.toOrders = function(v) {
        return this.loadURL('orders', v);
    };

    //初始化分享按钮
    jiao.showShareButton = function(){
        var res = '{}';
        if (this.shareData && typeof 'JSON' != 'undefined') {
            res = JSON.stringify(this.shareData);
        }
        return this.loadURL('sharebutton', res);
    };
    //取消分享按钮
    jiao.hideShareButton = function(){
        return this.loadURL('sharebutton', 0);
    };


    window.Jiao = jiao;
})();
