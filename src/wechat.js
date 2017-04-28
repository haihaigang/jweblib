/**
 * 微信jsapi相关的基础配置
 * 获取签名
 **/
(function(Config, Ajax) {

    var Base = function() {
        this._isDebug = false; //是否开启微信jsapi接口的调试模式
        this._appId = Config.APPID; //应用ID
        this._signUrl = '/wechat/mp/signature'; //获取签名的接口地址
        this._jsApiList = []; //需要操作的微信api列表
    }

    Base.prototype = {
        /**
         * 发起ajax请求，继承Ajax中的custom方法
         */
        _ajaxSend: function(options, successFn, errorFn) {
            Ajax.custom.call(Ajax, options, successFn, errorFn);
        },

        /**
         * 初始化微信配置
         */
        _initConfig: function() {
            var that = this;
            this._ajaxSend({
                url: this._signUrl,
                data: {
                    url: document.URL //签名需要是未编码的地址，如果接口没有解析直接传值
                }
            }, function(response) {
                var data = response;

                //在调用wx.ready之前必先调用wx.Config
                wx.config({
                    debug: that._isDebug,
                    appId: data.appId,
                    timestamp: data.timestamp,
                    nonceStr: data.nonceStr,
                    signature: data.signature,
                    jsApiList: that._jsApiList
                }), wx.error(function() {})
            }, function(textStatus, data) {
                Tools.showAlert('获取微信签名错误');
            })
        },

        /**
         * 追加微信jsapilist列表
         * @param {[type]} apis [description]
         */
        _addJsApiList: function(apis) {
            if (!apis && !apis.length) {
                return;
            }
            this._jsApiList = this._jsApiList.concat(apis);
        }
    }

    var WechatCommon = {};
    WechatCommon.Base = Base;
    window.WechatCommon = WechatCommon;
})(Config, Ajax);
