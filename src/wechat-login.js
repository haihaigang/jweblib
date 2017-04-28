/**
 * 微信自动登录
 * 说明：
 * 1. 首先判断用户是否登录，在未登录的时候在自动登录
 * 2. 然后根据是否存在code参数，确定是否跳转到微信授权页面（获取code）
 * 3. 其次根据上步获得的code参数调用接口获取用户信息（获取用户，接口服务端实现，一般也会实现登录功能）
 * 4. 最后调用接口成功后，去除code参数刷新当前页
 * 
 * 自动登录
 * WechatCommon.Login.autoLogin(fn)
 **/
(function(WechatCommon) {

    /**
     * 登录
     */
    var Login = function() {
        this._isLogining = false;
        //微信授权跳转地址
        this._oAuthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE&connect_redirect=1#wechat_redirect';
    }

    // 继承Base
    Login.prototype = new WechatCommon.Base();

    /**
     * 自动登录
     * @param fn 登录成功后的回调，一般在这里处理登录后的用户信息存储
     * @return
     */
    Login.prototype.login = function(fn) {
        var code = Tools.getQueryValue('code');

        if(!Tools.isWeChatBrowser()){
            // 仅在微信浏览器中才跳转
            return;
        }

        if (this._isLogining) return; //过滤多次的登录请求

        this._isLogining = true;

        if (void 0 === code || "" == code) {
            //尤其注意：由于授权操作安全等级较高，所以在发起授权请求时，微信会对授权链接做正则强匹配校验，如果链接的参数顺序不对，授权页面将无法正常访问
            //?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE&connect_redirect=1#wechat_redirect
            var n = location.origin + Tools.removeParamFromUrl(["from", "code", "share_id", "isappinstalled", "state", "m", "c", "a"]),
                t = this._oAuthUrl;

            t = t.replace('APPID', this._appId).replace('REDIRECT_URI', encodeURIComponent(n)).replace('SCOPE', 'snsapi_userinfo');
            location.href = t;
        } else {
            this._ajaxSend({
                url: '/members/signin/wechat',
                data: {
                    code: code
                },
                type: 'POST',
                contentType: 'application/json'
            }, function(response) {
                this._isLogining = false;
                fn && fn(response);
            }, function(textStatus, data) {
                console.error(data.message);
                this._isLogining = false;
            })
        }
    }

    WechatCommon.Login = new Login();
})(WechatCommon);
