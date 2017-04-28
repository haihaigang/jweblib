/**
 * 微信定位相关功能
 **/
(function(WechatCommon) {
    var locationInte = undefined;

    /**
     * 使用百度地图定位
     * @param fn 定位成功的回调
     * @param errorFn 定位失败的回调
     */
    function _wechatGetLocation2(fn, errorFn) {
        //设置5秒定位不到结果给用户提示信息
        locationInte = setTimeout(function() {
            Common.locationError && Common.locationError();
        }, 5000);

        // 百度地图API功能
        var point = new BMap.Point(116.331398, 39.897445);
        var geolocation = new BMap.Geolocation();
        geolocation.getCurrentPosition(function(r) {
            if (locationInte) clearTimeout(locationInte);

            if (this.getStatus() == BMAP_STATUS_SUCCESS) {
                if (r.address.province != '上海市') {
                    errorFn && errorFn(2);
                }
                var latitude = r.point.lat; // 纬度，浮点数，范围为90 ~ -90
                var longitude = r.point.lng; // 经度，浮点数，范围为180 ~ -180。
                //获取定位
                Ajax.custom({
                    url: Config.HOST_API_APP + '/building',
                    type: 'GET',
                    data: {
                        latitude: latitude,
                        longitude: longitude,
                    }
                }, function(response) {
                    if (response.body.length == 0) {
                        errorFn && errorFn(3)
                        return;
                    }
                    // Storage.set('BuildInfo', response.body[0]);
                    fn && fn(response.body[0]);
                }, function(textStatus, data) {
                    errorFn && errorFn(3);
                    Tools.showToast(data.message || '服务器异常');
                })
            } else {
                errorFn && errorFn(1);
            }
        }, {
            enableHighAccuracy: true
        })
    }

    /**
     * 使用微信地图定位
     * @param fn 定位成功的回调
     * @param errorFn 定位失败的回调
     */
    function _wechatGetLocation1(fn, errorFn) {
        //微信获取地址
        if (typeof wx == 'undefined' || Tools.isRbyAppBrowser()) return;

        _wechatShareConfig();

        wx.ready(function() {
            wx.getLocation({
                type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success: function(res) {
                    var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                    var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                    var speed = res.speed; // 速度，以米/每秒计
                    var accuracy = res.accuracy; // 位置精度
                    //获取定位
                    Ajax.custom({
                        url: Config.HOST_API_APP + '/building',
                        type: 'GET',
                        data: {
                            latitude: latitude,
                            longitude: longitude,
                        }
                    }, function(response) {
                        Storage.set('BuildInfo', response.body[0]);
                        fn && fn();
                    }, function(textStatus, data) {
                        Tools.showToast(data.message || '服务器异常');
                    })
                },
                cancel: function(res) {
                    errorFn && errorFn();
                }
            });
        })
    }

    /**
     * 微信支付相关功能
     */
    var Location = {
        /**
         * 获取地理位置
         * @param fn 定位成功的回调
         * @param errorFn 定位失败的回调
         */
        wechatGetLocation: function(fn, errorFn) {
            if (!1 && Tools.isWeChatBrowser()) {
                _wechatGetLocation1(fn, errorFn);
            } else {
                _wechatGetLocation2(fn, errorFn);
            }
        }
    };

    WechatCommon = WechatCommon || {};
    WechatCommon.Location = Location;
})(WechatCommon);
