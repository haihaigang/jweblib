/**
 * 微信支付相关功能
 * 说明
 * 1. 调用接口获取预支付单的相关信息（接口主要实现提交信息到微信）
 * 2. 使用WeixinJSBridge的getBrandWCPayRequest调起微信支付
 * 
 * 发起支付
 * WechatCommon.Pay.weixinPayOrder(orderId, susFn, errorFn)
 **/
(function(WechatCommon) {

    // 支付
    function Pay() {}

    // 继承Base
    Pay.prototype = new WechatCommon.Base();

    /**
     * 微信支付
     * @param orderId 订单编号
     * @param susFn   支付成功的回调
     * @param errorFn 支付失败的回调
     */
    Pay.prototype.weixinPayOrder = function(orderId, susFn, errorFn) {
        this._ajaxSend({
            url: '/wechat/pay/parameters',
            data: {
                number: orderId
            },
            showLoading: true
        }, function(response) {
            if (typeof WeixinJSBridge == 'undefined') {
                return;
            }

            var r = response;
            WeixinJSBridge.invoke('getBrandWCPayRequest', {
                appId: r.appId,
                timeStamp: '' + r.timestamp,
                nonceStr: r.nonceStr,
                package: 'prepay_id=' + r.prepayId,
                signType: r.signType,
                paySign: r.signature
            }, function(o) {
                if ('get_brand_wcpay_request:ok' == o.err_msg) {
                    susFn && susFn(r);

                    // 有些情况需要在支付后等一段时间在跳转以确保支付回调能处理完成
                    // var stopTime = r.stopTime ? parseInt(r.stopTime) * 1000 : 2000;
                    // $('#tj-commit-panel').show();
                    // setTimeout(function() {
                    //     $('#tj-commit-panel').hide();
                    //     susFn && susFn(r);
                    // }, stopTime);
                } else if ('get_brand_wcpay_request:cancel' == o.err_msg) {
                    errorFn && errorFn();
                } else {
                    errorFn && errorFn();
                }
            })
        }, function(textStatus, data) {
            errorFn && errorFn();
        })
    };

    /**
     * 支付成功后的订单通知
     */
    Pay.prototype._getOrderPayStatus = function() {
        Ajax.custom({
            url: '/callback/getOrderPayStatus',
            showLoading: false
        });
    };

    WechatCommon.Pay = new Pay();
})(WechatCommon);
