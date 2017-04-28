/**
 * 浏览器检测
 */
!function(Utils){
    function Browser() {
        this._isMobile = false; //是否移动设备
        this._isPad = false; //是否是平板设备
        this._isChrome = false; // 是否是chrome浏览器
        this._isVersion = 0; //设备版本号

        this._init();
    }

    Browser.prototype = {
        /**
         * 初始化检测，获取浏览器类型、版本信息等
         * @return {[type]} [description]
         */
        _init: function() {

        },
        
        isWeChatBrowser: function() {
            var e = navigator.appVersion.toLowerCase();
            return "micromessenger" == e.match(/MicroMessenger/i) ? !0 : !1
        },
        isRbyAppBrowser: function() {
            var e = navigator.userAgent.toLowerCase();
            return "rbyapp" == e.match(/rbyapp/i) ? !0 : !1
        },
    };


    Utils.Browser = new Browser();
}(Utils)
