/**
 * 微信分享相关功能
 * 1.默认分享
 * WechatCommon.Share.defaultShare()
 * 2.自定义分享数据
 * WechatCommon.Share.commonShare(data)
 * data: {
 *     shareTitle: '分享标题',
 *     shareDesc: '分享描述',
 *     sharePic: '分享图片',
 *     shareLink: '分享链接',
 *     afterShareFn: '分享成功后的回调'
 * }
 **/
(function(Config, WechatCommon) {

    // 分享
    var Share = function() {
        this._title = undefined; //分享标题
        this._desc = undefined; //分享描述
        this._imgUrl = undefined; //分享图片
        this._url = undefined; //分享链接
        this._type = ''; //分享类型
        this._afterShareFn = undefined; //分享成功后的回调

        this._originData = undefined; //自定义分享的原始数据
        this._canOpenShare = false; //分享后是否打开提示

        // 追加分享使用的jsapilist列表
        this._addJsApiList(['onMenuShareTimeline', 'onMenuShareAppMessage']);
    }

    // 继承Base
    Share.prototype = new WechatCommon.Base();

    var prototypes = {
        /**
         * 默认分享，使用默认的图片、标题、描述、链接
         */
        defaultShare: function() {
            this._title = Config.DEFAULT_SHARE_DATA.SHARE_TITLE;
            this._desc = Config.DEFAULT_SHARE_DATA.SHARE_TEXT;
            this._imgUrl = Config.DEFAULT_SHARE_DATA.SHARE_PIC;
            this._url = Config.SHARE_HOST;

            this._initShare();
        },

        /**
         * 自定义分享数据，如果没有使用默认分享数据
         * @param data 分享的数据
         * {
         *     shareTitle: '分享标题',
         *     shareDesc: '分享描述',
         *     sharePic: '分享图片',
         *     shareLink: '分享链接',
         *     afterShareFn: '分享成功后的回调'
         * }
         */
        commonShare: function(data) {
            this._originData = data;

            if (!data || !data.sharePic) {
                //如果没有分享数据，使用默认分享
                this.defaultShare();
                return;
            }

            this._title = data.shareTitle;
            this._desc = data.shareDesc;
            this._imgUrl = data.sharePic;
            this._url = data.shareLink;
            this._type = data.type;
            this._afterShareFn = data.afterShareFn;

            this._initShare();
        },

        /**
         * 获取分享的数据
         */
        getShareData: function() {
            return {
                title: this._title,
                desc: this._desc,
                imgUrl: this._imgUrl,
                url: this._getUrl(),
                type: this._type
            }
        },

        /**
         * 获取分享的链接，追加一些参数
         */
        _getUrl: function() {
            var userSn = Cookie.get("UserSN"),
                url = this._url;

            //分享在url后追加上级用户ID
            var addParams = {
                referId: userSn
            };

            var paramArr = [];
            for (var i in addParams) {
                paramArr.push(i + '=' + addParams[i] || '');
            }

            if (paramArr.length > 0) {
                url = url + (url.indexOf('?') == -1 ? '?' : '&') + paramArr.join('&');
            }

            return url;
        },

        /**
         * 自定义微信分享数据
         * @return null
         */
        _initShare: function() {
            //未加载微信资源库则忽略
            if (typeof wx == 'undefined') {
                return;
            }

            this._initConfig();

            var that = this;

            wx.ready(function() {
                wx.onMenuShareTimeline({ //分享到朋友圈
                    title: that._title,
                    link: that._getUrl(),
                    imgUrl: that._imgUrl,
                    success: function() {
                        that._afterShare();
                    },
                    cancel: function() {}
                }), wx.onMenuShareAppMessage({ //分享给朋友
                    title: that._title,
                    desc: that._desc,
                    link: that._getUrl(),
                    imgUrl: that._imgUrl,
                    type: "link",
                    success: function() {
                        that._afterShare();
                    },
                    cancel: function() {}
                })
            })
        },

        /**
         * 分享成功后的处理
         */
        _afterShare: function() {
            if (this._canOpenShare) {
                // 界面操作，显示分享提示框
                $('#rby-cover-bg').show().addClass('dark');
                $('#rby-pin-share').hide();
                $('#rby-group-share-after').hide();
                $('#rby-pin-share-after').show();
            }

            this._shareTargetStat();

            this._afterShareFn && this._afterShareFn();
        },

        /**
         * 分享埋点，每次成功分享之后触发
         */
        _shareTargetStat: function(data) {
            if (!data) {
                return;
            }
        }
    };

    for (var i in prototypes) {
        Share.prototype[i] = prototypes[i];
    }

    WechatCommon.Share = new Share();
})(Config, WechatCommon);
