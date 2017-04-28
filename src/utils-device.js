/**
 * 设备相关
 */
! function(Utils) {
    function Device() {
        this._isMobile = false; //是否移动设备
        this._isPad = false; //是否是平板设备
        this._isChrome = false; // 是否是chrome浏览器
        this._isVersion = 0; //设备版本号

        this._init();
    }

    Device.prototype = {
        /**
         * 初始化检测，获取浏览器类型、版本信息等
         * @return {[type]} [description]
         */
        _init: function() {

        },
        isIPad: function() {
            return (/iPad/gi).test(navigator.appVersion);
        },
        isIos: function() {
            return (/iphone|iPad/gi).test(navigator.appVersion);
        },
        isAndroid: function() {
            return (/android/gi).test(navigator.appVersion);
        },
    };

    Utils.Device = new Device();
}(Utils)
