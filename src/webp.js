/**
 * webp相关，依赖Config
 */
(function(Config, window) {
    var Webp = {
        _isDetecting: true, //是否正在检测
        _isSupport: false, //是否支持
        /**
         * 获取浏览器兼容结果，兼容true否则false
         * @return boolean
         */
        getSupport: function() {
            if (!Config.IS_WEBP_ON || this._isDetecting) {
                return false;
            }
            return this._isSupport;
        },
        /**
         * 检测当前客户端是否兼容webp
         * 新建一个webp格式的图片，查看图片能否正确load且图片宽高是否正确
         */
        _detect: function() {
            var img = new Image();

            img.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
            img.onload = img.onerror = function() {
                Webp._isDetecting = false;
                if (img.width === 2 && img.height === 2) {
                    Webp._isSupport = true;
                } else {
                    Webp._isSupport = false;
                };
            };
        }
    };

    Webp._detect(); //这里需要尽可能早地检测兼容性，以便能尽可能早地使用

    window.Webp = Webp;
})(Config, window);
