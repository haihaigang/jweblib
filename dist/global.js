// 是否调试模式,线上为false
window.IS_DEBUG = false;

// 版本号，请确保版本号在最后，方便自动生成版本号追加覆盖
window.VERSION = '2.4.4';
// 20170206185854

window.VERSION = '2.4.5';// 20170221110703

window.VERSION = '2.4.7';;/**
 * js报错记入服务器
 */
(function() {
    var onerror_count = 0;//发送错误计数，每个页面只发送一次

    /**
     * 记录错误日志
     * @param msg 错误描述
     * @param url 错误的文件地址
     * @param row 错误的行数
     * @param column 错误所在的列
     * @return
     */
    function handleErr(msg, url, row, column) {
        if (onerror_count >= 1) return

        var html = "<iframe src='/error.html' style='display: none' frameborder='0' height='0' width='0' id='iframe-error'></iframe>";
        $("body").append(html);
        var iframe = document.getElementById("iframe-error");
        var iframeDocument = iframe.contentWindow;
        iframeDocument.onload = function() {
            var form = iframeDocument.document.getElementById('inner-form')
            form.querySelector("[name=message]").value = msg;
            form.querySelector("[name=url]").value = url;
            form.querySelector("[name=row]").value = row;
            form.querySelector("[name=column]").value = column;
            form.querySelector("[name=host]").value = location.href;
            form.submit();

        }

        onerror_count++
    }

    window.onerror = handleErr;
})()
;/**
 * 配置信息
 * 把配置信息分为基础配置、提示信息
 */
(function() {
    var Config = {
        PAGE_SIZE: 10, //默认分页大小
        PAGE: 1, //当前第几页，从1开始
        HOST_API: '/wechat', //相对地址
        HOST_IMAGE: location.protocol + '//' + location.host + '/', //图片地址的前缀，完整地址
        SHARE_HOST: location.protocol + '//' + location.host, //分享链接前缀，完整地址
        DEF_IMG_URL: '../content/images/default.png', //默认图片
        APPID: "wx9c0b5913dd495352", //微信appId，正式
        WHITELISTS: [ //静态资源的白名单
            'rbyair.com',
            'meigooo.com',
            'meigo.com',
            'baidu.com',
            'qq.com',
        ],
        IS_FILTER_ON: true, //是否开启静态资源过滤
        OSS_HOST: 'http://img01.rbyair.com', //oss的域名
        IS_WEBP_ON: true, //是否开启webp功能
        IS_MOCK_ON: false, //是否开启mock接口
        VERSION: '0.0.1' //版本号
    };

    if ('IS_DEBUG' in window) {
        Config.IS_DEBUG = IS_DEBUG;
    }

    if ('VERSION' in window) {
        Config.VERSION = VERSION;
    }

    if (Config.IS_DEBUG) {
        //配置测试相关信息
        Config.APPID = "wx9c0b5913dd495352"; //微信appId，测试
    }

    Config.DETAIL_SHARE_LINK = Config.SHARE_HOST + '/detail.html?id={ID}&cid={CID}'; //商品详情的分享链接
    Config.COUPON_SHARE_LINK = Config.SHARE_HOST + '/detail.html?cid={CID}'; //优惠券详情的分享链接

    Config.ORDER_STATUS = { //订单状态
        PENDING: '未支付',
        PROCESSING: '已支付待发货',
        IN_TRANSIT: '已发货',
        DELIVERED: '已完成',
        PAYMENT_DUE: '支付超时',
        CANCELLED: '已取消',
        RETURNED: '已退货'
    };

    Config.LEVEL = { //用户等级
        USER: '用户',
        MEMBER: '会员',
        AGENT: '代理',
        GENERAL_AGENT: '总代理'
    };

    Config.DEFAULT_SHARE_DATA = { //默认分享数据
        SHARE_TITLE: '90+营养代餐健康购',
        SHARE_TEXT: '含有12大类，90多种食材，198元/盒，更多惊喜请点击',
        SHARE_PIC: Config.SHARE_HOST + '/content/images/logo.png' //默认头像
    };

    Config.COUPON_SHARE_DATA = { //优惠券的分享数据
        SHARE_TITLE: '90+营养代餐免费领',
        SHARE_DESC: '一份分享，一份爱心，收获一份健康，点击免费领取',
        SHARE_PIC: Config.SHARE_HOST + '/content/images/share-coupon.jpg'
    };

    Config.INCOMES_TYPE = {//收益类型
        'PROFIT1': '一级分利',
        'PROFIT2': '二级分利',
        'SALES': '差额收益',
        'REWARD': '奖励收益',
        'WITHDRAWAL': '提现',
        'WITHDRAWAL_RETURN': '提现退还'
    };

    window.Config = Config;
})();
;/**
 * 过滤http拦截，这里需要尽可能在自定义的代码之前
 * 解决页面被劫持问题，通过配置白名单策略
 */
(function() {
    if (!Config.IS_FILTER_ON || !('MutationObserver' in window)) {
        return;
    }

    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            var nodes = mutation.addedNodes;
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].nodeName == 'SCRIPT' && !_isWhite(nodes[i].src)) {
                    nodes[i].src = '';
                }
            }
        });
    });

    observer.observe(document, { //初始化行为
        childList: true,
        subtree: true
    });

    function _isWhite(url) {
        if (!Config.WHITELISTS) {
            return true;
        }
        //添加当前域名
        Config.WHITELISTS.push(location.hostname);

        if (!url) {
            return true;
        }

        if (url.indexOf('//') != 0 && url.indexOf('http://') != 0 && url.indexOf('https://') != 0) {
            return true;
        }
        var obj = url.replace('https://', '').replace('http://', '').replace('//', '');
        var obj = obj.split('/');

        var flag = false;
        for (var i in Config.WHITELISTS) {
            if (obj[0].indexOf(Config.WHITELISTS[i]) != -1) {
                flag = true;
                break;
            }
        }
        console.log(url + ' is white? ' + flag);

        return flag;
    }
})();
;/**
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
;//debug
var log = function(m) {
    if (typeof console != 'undefined') {
        console.log(m);
    }
};/**
 * 封装异步请求
 * 包含通用的四大类请求
 * paging
 * detail
 * submit
 * custom
 */
(function() {
    var NODATA = '<div class="nodata">暂无数据。</div>',
        NOMOREDATA = '没有更多数据',
        SYSTEMERROR = '<div class="nodata">服务器异常。</div>',
        DATAERROR = '<div class="nodata">数据错误。</div>',
        csrftoken,
        loadingDom = $('#tj-loading'),
        loadingCount = 0; //ajax 计数   防止未ajax走完的loading  被其他ajax结束流程终止

    /**
     * 接口基类
     */
    function Api(options) {
        this.options = options || {};
        this.timeout = 15000; //请求超时时间
        this.cache = true; //是否缓存
        this.defaultListTmpl = 'tj-list-tmpl';
        this.defaultListEle = '#tj-list';
        this.defaultDetailTmpl = 'tj-detail-tmpl';
        this.defaultDetailEle = '#tj-detail';
        this.isLoading = false; //是否正在请求
        this.hasNext = true; //是否有下一页
        this.queue = {}; //请求队列
        this.tempPage = {}; //分页dom
        this.onEnd = function() {}; //当请求都完成
    }

    Api.prototype._init = function() {
        var spinnings = this.spinnings;

        return this;
    }

    /**
     * 分页查询，获取列表类型数据，自动绑定分页，当数据为空时提示无数据，当接口异常或解析错误提示服务器异常
     *
     * @param options-请求参数
     * *****
     * url 请求URL
     * data 请求数据 {} $(form)
     * type 请求类型 GET POST
     * renderFor 渲染模板
     * renderEle 渲染容器
     * showLoading 是否显示loading提示 true false
     * *****
     * pagingDom 分页容器
     * pagingMode 分页形式 'number'、'next'、'' 默认 number
     * key 分页数据的关键字 默认'body' '-1'时整个返回值为分页数据
     * emptyEle 空数据提示dom
     * showEmpty 是否显示空数据提示
     * noMoreData 无更多数据的提示文字
     * showNoMoreData 是否显示无更多数据的提示
     * *****
     * @param callback-请求成功后执行的回调方法
     * @param callbackError-请求失败后执行的回调方法
     */
    Api.prototype.paging = function(options, callback, callbackError) {
        var that = this,
            isFirst = options.data.page == 1, //是否第一次请求
            size = options.data.pageSize || options.data.size,
            opt = { //默认配置
                renderFor: this.defaultListTmpl,
                renderEle: this.defaultListEle,
                pagingDom: '.pagination',
                pagingMode: 'next',
                timeKey: 'createAt',
                key: '-1',
                showLoading: true,
                logtype: 'paging',
                emptyEle: '#tj-empty'
            };

        extend(options, opt);

        that.ajaxSend(options, function(response, textStatus, jqXHR) {
            var body = getDataWithKey(response, options.key);

            if (options.key == '-1') {
                //设置key=-1，所有返回值为分页数据
                body = response;
            }

            if (!that.isSusPagingData(body)) {
                $(options.renderEle).html(DATAERROR);
                next.hide();
                return;
            }
            if (typeof options.beforeRender == 'function') {
                options.beforeRender(response);
            }

            if (options.pagingMode == 'number') {
                $(options.renderEle).html('正在加载中...');
                $(options.pagingDom).hide();
            } else if (options.pagingMode == 'next') {
                var np = findByKey(that.tempPage, options.url);
                //一个页面只有一个分页
                np = 1;
                var next = $(options.renderEle).parents().find(".nextpage"),
                    nextStr = '<div data-id="np-' + np + '" class="nextpage">正在加载中...</div>';

                if (next.length == 0) {
                    $(options.renderEle).after(nextStr);
                    next = $("[data-id='np-" + np + "']");
                }
                next.html('正在加载中...').addClass('disabled');

                if (isFirst) {
                    //查第一页数据一定清空当前容器
                    $(options.renderEle).html('');
                    $(options.emptyEle).hide();
                }
            }


            if (options.pagingMode == 'number') {
                if (!body || body.length == 0) {
                    //数据没有结果显示无数据提示
                    if (isFirst) {
                        $(options.renderEle).html(NODATA);
                    }
                } else {
                    that.render(options.renderEle, options.renderFor, body);
                }

                initPagination(response.pageInfo, options.pagingDom);
            } else if (options.pagingMode == 'next') {
                if (body.length == 0) {
                    //数据没有结果显示无数据提示
                    if (isFirst) {
                        next.hide();
                        if (options.showEmpty && $(options.emptyEle).length > 0) {
                            $(options.emptyEle).show();
                        } else {
                            $(options.renderEle).html(NODATA);
                        }
                    } else {
                        next.html(NOMOREDATA)
                        next.hide();
                    }
                } else {
                    that.hasNext = body.length >= size;
                    next.show();
                    that.render(options.renderEle, options.renderFor, body, !isFirst);
                    if (!that.hasNext) {
                        if (options.showNoMoreData) {
                            //没有下一页显示无更多数据提示
                            next.html(options.noMoreData || NOMOREDATA);
                        } else {
                            next.hide();
                        }
                    } else {

                        next.html('正在加载更多').removeClass('disabled');
                        // options.nextButton && next.html(options.nextButton.text || '加载更多');
                    }
                }
            }

            if (typeof callback == 'function') {
                callback(response);
            }
        }, function(textStatus, data) {
            $(options.renderEle).html(SYSTEMERROR);
            if (typeof callbackError == 'function') {
                callbackError(textStatus, data);
            }
        });
        //异步 分页导航 模板渲染 绑定分页事件 = 分页
    };

    /**
     * 详情查询
     *
     * @param options-请求参数
     * *****
     * url 请求URL
     * data 请求数据 {} $(form)
     * type 请求类型 GET POST
     * renderFor 渲染模板
     * renderEle 渲染容器
     * showLoading 是否显示loading提示 true false
     * *****
     * @param callback-请求成功后执行的回调方法
     * @param callbackError-请求失败后执行的回调方法
     */
    Api.prototype.detail = function(options, callback, callbackError) {
        var that = this,
            opt = { //默认配置
                renderFor: this.defaultDetailTmpl,
                renderEle: this.defaultDetailEle,
                key: 'body',
                showLoading: true,
                logtype: 'detail'
            };

        extend(options, opt);

        if (options.showLoading) {
            $(options.renderEle).html('<div class="loading">加载中...</div>');
        }

        that.ajaxSend(options, function(response, textStatus, jqXHR) {
            log('ajaxSend end ' + new Date().getTime())
            if (response.error) {
                $(options.renderEle).html(response.error);
                return;
            }
            var data = response[options.key] || {};
            if (data) {
                render(options.renderEle, options.renderFor, data);
            }
            if (typeof callback == 'function') {
                callback(response);
            }
        }, callbackError);
    };

    /**
     * 表单提交
     *
     * @param options-请求参数
     * *****
     * url 请求URL
     * data 请求数据 {} $(form)
     * type 请求类型 GET POST
     * showLoading 是否显示loading提示 true false
     * *****
     * @param callback-请求成功后执行的回调方法
     * @param callbackError-请求失败后执行的回调方法
     */
    Api.prototype.submit = function(options, callback, callbackError) {
        var formData,
            that = this,
            isForm = !!options.data.length,
            btnSubmit,
            opt = {
                type: 'POST',
                showLoading: true,
                logtype: 'submit'
            };

        extend(options, opt);

        if (isForm) {
            formData = options.data.serializeArray();
            btnSubmit = options.data.find('[type="submit"]');
            btnSubmit.attr('disabled', true);
        } else {
            formData = options.data;
        }
        options.data = formData;

        that.ajaxSend(options, function(response, textStatus, jqXHR) {
            if (isForm) {
                btnSubmit.removeAttr('disabled');
            }
            if (typeof callback == 'function') {
                callback(response);
            }
        }, function(jqXHR, textStatus, errorThrown) {
            if (isForm) {
                btnSubmit.removeAttr('disabled');
            }
            if (typeof callbackError == 'function') {
                callbackError(jqXHR, textStatus, errorThrown);
            }
        });
    };

    /**
     * 自定义查询
     *
     * @param options-封装请求url，请求数据，请求类型
     * @param callback-请求成功后执行的回调方法
     * @param callbackError-请求失败后执行的回调方法
     */
    Api.prototype.custom = function(options, callback, callbackError) {
        var that = this,
            opt = {
                logtype: 'custom',
                emptyEle: '#tj-empty'
            };

        extend(options, opt);

        that.ajaxSend(options, function(response) {
            if (!response || response.length == 0) {
                if (options.showEmpty && $(options.emptyEle).length > 0) {
                    $(options.emptyEle).show();
                }
            }
            callback && callback(response);
        }, callbackError);
    };

    /**
     * jquery.ajax
     */
    Api.prototype.ajaxSend = function(options, callback, callbackError) {
        var that = this,
            userToken = null,
            queueKey = options.url;
        that.isLoading = true;
        that.queue[queueKey] = true;
        loadingCount++;

        options = options || {};
        if (options.showLoading) {
            // $(options.renderEle).hide();
            loadingDom.show();
        }

        if (Config.IS_MOCK_ON || options.isMockOn) {
            options.url = '/api' + options.url + '.json';
        }
        options.url = '/api' + options.url;

        //追加坑位统计参数
        var position = Cookie.get('MeiPosition');
        if (position) {
            options.url += (options.url.indexOf('?') != -1 ? '&' : '?') + 'rudder_route=' + position;;
        }

        //追加活动页页面ID统计
        var RudderPageId = Cookie.get('RudderPageId') || undefined;

        //追加统计的头信息，优先获取native传递的头信息
        var header = {
            'RudderAppType': 'WEB',
            'RudderMarket': 'WEB',
            'RudderVersion': Config.VERSION,
        };
        if (RudderPageId) header.RudderPageId = RudderPageId;

        var appHeader = Storage.get('AppHeader');
        if (appHeader) {
            //转换native内嵌微官网的参数，头信息约定参数命名规则改成驼峰命名
            if (appHeader.rudder_appType) {
                header.RudderAppType = appHeader.rudder_appType;
                header.RudderMarket = appHeader.rudder_market;
                header.RudderDeviceId = appHeader.rudder_deviceId;
                header.RudderActivityId = appHeader.rudder_activityId;
                header.RudderDeviceInfo = appHeader.rudder_deviceInfo;
            } else {
                header = appHeader;
            }
        }

        userToken = Cookie.get('AccessToken');


        if (userToken) {
            header['x-auth-token'] = userToken;
        }

        if (typeof options.contentType == undefined) {
            // options.contentType = 'application/json'
        }
        if (typeof options.processData == undefined) {
            options.processData = true;
        }

        if (options.contentType == 'application/json') {
            options.data = JSON.stringify(options.data);
        }

        $.ajax({
            url: options.url,
            data: options.data,
            type: options.type || 'GET',
            dataType: 'json',
            timeout: that.timeout,
            cache: that.cache,
            contentType: options.contentType,
            processData: options.processData,
            headers: header,
            success: function(response, textStatus, jqXHR) {
                Tools.alert("success data:" + JSON.stringify(response).substring(0, 300));
                that.isLoading = false;
                delete(that.queue[queueKey]);

                if (typeof callback == 'function') {
                    if (options.url.indexOf('/members/signin/wechat') != -1) {
                        // 自动登录的追加token到response上
                        if (!response) {
                            response = {};
                        }
                        response.accessToken = jqXHR.getResponseHeader('x-auth-token');
                    }
                    callback(response);
                }
                if (isEmpty(that.queue) && typeof that.onEnd == 'function') {
                    that.onEnd.call(this);
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                Tools.alert("error data: " + JSON.stringify(jqXHR.response));
                that.isLoading = false;
                delete(that.queue[queueKey]);

                logged(options.logtype, textStatus, options.url);

                if (jqXHR.status == 401) {
                    //若接口提示未登录，自动登录
                    WechatCommon.Login.autoLogin();
                    return;
                }

                if (typeof callbackError == 'function') {
                    callbackError(textStatus, JSON.parse(jqXHR.response));
                }

                if (isEmpty(that.queue) && typeof that.onEnd == 'function') {
                    that.onEnd.call(this);
                }
            },
            complete: function(xhr, status) {
                loadingCount--;
                if (loadingCount == 0) {
                    setTimeout(function() {
                        loadingDom.hide();
                    }, 100)
                }
                $(options.renderEle).show();
            }
        });
    }

    /**
     * 数据渲染到模板
     * @param renderEle-渲染容器
     * @param renderFor-渲染模版
     * @param data-数据
     * @param isAppend-是否追加
     */
    function render(renderEle, renderFor, data, isAppend) {
        if ($('#' + renderFor).length > 0 && data) {
            if (typeof data.length != 'undefined') {
                data = {
                    'list': data
                };
            }
            var result = tmpl(renderFor, data);
            if (isAppend) {
                $(renderEle).append(result);
            } else {
                $(renderEle).html(result);
            }
        }
    }

    /**
     * 使用模板
     * @param renderFor 模板名称
     * @data 数据
     */
    function tmpl(renderFor, data) {
        return template.render(renderFor, data);
    }

    /**
     * 记录接口的错误日志
     * @param type-接口请求类型
     * @param message-错误内容
     * @param url-错误地址
     */
    function logged(type, message, url) {
        log('[' + type + '] ' + message + ':' + url, 2);
    }

    /**
     * 判断对象是否为空
     * @param  {[type]}
     * @return {Boolean}
     */
    function isEmpty(obj) {
        var flag = true;
        for (var i in obj) {
            flag = false;
            break;
        }

        return flag;
    }

    /**
     * 验证key是否存在obj中
     * @param  obj 要验证的对象
     * @param  key 要验证的关键字
     */
    function findByKey(obj, key) {
        var arr = [],
            tar;
        for (var i in obj) {
            arr.push(obj[i]);
            if (key == i) {
                tar = obj[i];
            }
        }

        if (arr.length == 0) return obj[key] = 1;
        if (tar) return tar;
        arr = arr.sort();
        return obj[key] = arr[arr.length - 1] + 1;
    }

    /**
     * 初始化数字分页
     * @param  data 分页数据
     * current 当前页
     * size 每页条数
     * count 总记录数
     * @param  dom 分页的容器
     */
    function initPagination(data, dom) {
        if (!data) return; //数据错误不初始化

        var d = {
            current_page: data.current,
            per_page: data.size,
            total: data.count
        };

        d.current_page = parseInt(d.current_page);
        d.total = parseInt(d.total);
        d.per_page = parseInt(d.per_page);
        d.total = Math.ceil(d.total / d.per_page);

        d.prev_page = d.current_page == 1 ? 1 : d.current_page - 1;
        d.next_page = d.current_page == d.total ? d.current_page : d.current_page + 1;
        var start = d.current_page - 2,
            end = d.current_page + 2;

        if (d.total <= 5) {
            start = 1;
            end = d.total;
        } else {
            if (start < 1) {
                start = 1;
                end = start + 4;
            }
            if (end > d.total) {
                end = d.total;
                start = d.total - 4;
            }
        }

        var result = '';

        result += '<dl><dt' + (d.prev_page == 1 ? ' class="disabled"' : '') + '><a href="#' + d.prev_page + '"><img src="images/arrow_left.gif"></a></dt><dd>';
        for (var i = start; i <= end; i++) {
            result += '<a href="#' + i + '"' + (d.current_page == i ? ' class="active"' : '') + '>' + i + '</a>';
        }
        result += '</dd><dt class="ari' + (d.next_page >= d.total ? ' disabled' : '') + '"><a href="#' + d.next_page + '"><img src="images/arrow_left.gif"></a></dt></dl>';

        $(dom).html(result).show();
    }

    /**
     * 扩展参数
     * @param  options 被扩展参数 
     * @param  opt 扩展参数
     */
    function extend(options, opt) {
        options = options || {};
        for (var i in opt) {
            options[i] = typeof options[i] == 'undefined' ? opt[i] : options[i];
        }
    }

    /**
     * 是否正确的分页数据
     * @param  data 分页数据
     * @return {Boolean}
     */
    function isSusPagingData(data) {
        return !!data && (typeof data == 'object' && typeof data.length != undefined);
    }

    /**
     * 从对象中按照字符串规则取出目标数据
     * @param data 数据
     * @param keyStr 字符串，eg: data.body.list
     */
    function getDataWithKey(data, keyStr) {
        if (!keyStr) {
            return data;
        }
        if (keyStr.indexOf('.') == -1 && keyStr.indexOf('[') == -1) {
            return data[keyStr];
        }
        var keyArr = keyStr.split('.'),
            len = keyArr.length,
            i = 0,
            tempObj = data,
            reg = /^(.*)\[(\d+)\]$/;

        while (i < len) {
            if (reg.test(keyArr[i])) {
                var result = reg.exec(keyArr[i]);
                if (!tempObj[result[1]]) {
                    tempObj = '';
                    break;
                }
                tempObj = tempObj[result[1]][result[2]];
            } else {
                tempObj = tempObj[keyArr[i]];
            }
            i++;
        }
        return tempObj;
    }

    //抛出公用方法，保持模板调用入口唯一
    Api.prototype.render = render;
    Api.prototype.logged = logged;
    Api.prototype.isSusPagingData = isSusPagingData;

    Api.prototype.isEnd = function() {
        return isEmpty(this.queue);
    }

    window.Ajax = new Api();
})()
;/**
* 自定义提示框，依赖jquery
* 
* Dialog.showAlert('')
* Dialog.showConfirm('')
* Dialog.showAlert(options)
* Dialog.showConfirm(options)
*
* options说明
* {
*     type: '弹框类型',
*     tick: '自动关闭的时间，0不关闭，默认0',
*     message: '提示正文内容，富文本',
*     okText: '确定按钮的文字',
*     cancelText: '取消按钮的文字',
*     showTitle: '是否显示标题，默认不显示',
*     titleText: '标题文字',
*     showTips: '是否显示提示，默认不显示',
*     tipsText: '提示文字',
*     className: '追加的内容样式名称',
*     yesCallback: '点击确定按钮的回调',
*     noCallback: '点击取消按钮的回调',
*     tipCallback: '点击提示信息的回调'
* }
*
* 依赖的dom结构，示例用
* <div class="dialog" id="tj-panel">
      <div class="dialog-content">
          <div class="panel-content">
              <div class="panel-cell">
                  <h3 class="panel-title">xxx</h3>
                  <div class="panel-text">xxx</div>
              </div>
          </div>
          <div class="panel-buttons">
              <div class="options">
                  <a href="javascript:;" class="btn btn-default">取消</a>
                  <a href="javascript:;" class="btn btn-primary">确定</a>
              </div>
              <div class="panel-tips">xxx</div>
          </div>
      </div>
  </div>
**/
(function() {
    var that = this,
        preventDefault, panel, panelBg, delay, count = 0,
        toastPanel, temp;

    //自定义提示框
    var Dialog = function(el, options) {
        var that = this;

        that.panel = el || $('#tj-panel');
        that.panelBg = panelBg || $('#tj-panel-bg');
        that.dialogContent = that.panel.find('.dialog-content');
        that.panelContent = that.panel.find('.panel-content');
        that.panelTitle = that.panel.find('.panel-title');
        that.panelTips = that.panel.find('.panel-tips');
        that.panelButtons = that.panel.find('.panel-buttons');
        that.btnOk = that.panel.find('.btn-primary');
        that.btnCancel = that.panel.find('.btn-default');
        that.panelText = that.panel.find('.panel-text');
        that.panelTick = that.panel.find('.panel-tick');
        that.panelInput = that.panel.find('.panel-input');

        that.commitPanel = el || $('#tj-commit-panel');
        that.commitDialogContent = that.commitPanel.find('.commit-dialog-content');

        that.options = {
            type: 'error',
            tick: 0,
            okText: '确定',
            cancelText: '取消',
            showTitle: false,
            showTips: false,
            textAlign: 'center',
        };

        //关闭
        that.panel.on('click', '.btn-primary', function(e) {
            e.preventDefault();
            that.hide(true);
        });

        //取消
        that.panel.on('click', '.btn-default', function(e) {
            e.preventDefault();
            that.hide();
        });

        if (that.panel.length > 0) {
            that.panel[0].addEventListener('touchmove', function(e){
                e.preventDefault();
            }, true);
        }
    };

    Dialog.prototype = {
        delay: undefined,
        count: 0,
        setOptions: function(options) {
            var that = this;

            for (i in options) that.options[i] = options[i];

            if (that.options.showTitle) {
                that.panelTitle.show();
            } else {
                that.panelTitle.hide();
            }
            if (that.options.showTips) {
                that.panelTips.show();
            } else {
                that.panelTips.hide();
            }
            if (that.options.panelInput) {
                that.panelInput.show();
            } else {
                that.panelInput.hide();
            }
            if (that.options.okText) {
                that.btnOk.text(that.options.okText);
            }
            if (that.options.cancelText) {
                that.btnCancel.text(that.options.cancelText);
            }
            if (that.options.tipsText) {
                that.panelTips.html(that.options.tipsText);
            }
            if (that.options.titleText) {
                that.panelTitle.text(that.options.titleText);
            }
            if (that.options.type == 'confirm') {
                that.btnOk.show();
                that.btnCancel.show();
            } else if (that.options.type == 'prompt') {
                that.btnOk.show();
                that.btnCancel.show();
            } else {
                that.btnOk.show();
                that.btnCancel.hide();
            }
            if (that.options.className) {
                that.panelText.addClass(that.options.className);
            } else {
                that.panelText.removeClass(that.options.className);
            }

            that.panelText.html(that.options.message);
            that.panel.show();
            that.panelBg.show();

            //确定窗口位置
            if (that.dialogContent.height() > $(window).height()) {
                that.dialogContent.css({
                    'margin-top': 0,
                    'top': 0
                });
            } else {
                that.dialogContent.css({
                    'margin-top': -(that.dialogContent.height() / 2),
                    'top': '50%'
                });
            }


            //确定窗口位置
            // if (that.commitDialogContent.height() > $(window).height()) {
            //     that.commitDialogContent.css({
            //         'margin-top': 0,
            //         'top': 0
            //     });
            // } else {
            //     that.commitDialogContent.css({
            //         'margin-top': -(that.commitDialogContent.height() / 2),
            //         'top': '50%'
            //     });
            // }
            that.panelContent.css('max-height', ($(window).height() - that.panelButtons.height()));
            // document.addEventListener('touchmove', prevent, true);

            if (that.options.tick > 1000) {
                that.panelTick.text(that.options.tick / 1000);
                that.delay = setInterval(function() {
                    if (that.count < that.options.tick - 1000) {
                        that.count = count + 1000;
                        that.panelTick.text((that.options.tick - count) / 1000);
                    } else {
                        that._end();
                        that.count = 0;
                        clearInterval(that.delay);
                    }
                }, 1000);
            } else if (that.options.tick <= 1000 && that.options.tick > 0) {
                that.delay = setTimeout(function() {
                    that._end();
                }, that.options.tick);
            }
        },
        _end: function() {
            var that = this;

            that.panel.hide();
            that.panelBg.hide();

            if (typeof that.options.tipsCallback == 'function') {
                that.options.tipsCallback();
                that.options.tipsCallback = undefined;
            } else if (typeof that.options.yesCallback == 'function') {
                that.options.yesCallback();
                that.options.yesCallback = undefined;
            }
        },
        hide: function(yesClick) {
            var that = this;

            if (that.delay) {
                clearTimeout(that.delay);
            }
            if (!that.panel) {
                return;
            }
            that.panel.hide();
            that.panelBg.hide();

            if (yesClick) {
                typeof that.options.yesCallback == 'function' && that.options.yesCallback();
            } else {
                typeof that.options.noCallback == 'function' && that.options.noCallback();
            }
            that.options.yesCallback = undefined;
            that.options.noCallback = undefined;
            // document.removeEventListener('touchmove', prevent,true);
        },
        preventDefault: function(e) {
            e.preventDefault();
        },
        // 显示确认框
        showConfirm: function(msg, yesCallback, noCallback) {
            var opt = {};
            if (typeof msg == 'object') {
                opt = msg;
            } else {
                opt.message = msg;
                opt.yesCallback = yesCallback;
                opt.noCallback = noCallback;
            }
            opt.type = 'confirm';
            opt.showTitle = true;
            opt.showTip = false;
            opt.titleText = opt.titleText || '提示';
            opt.className = opt.className || 'text-c';

            panel = panel || new Dialog();
            panel.setOptions(opt);
        },
        // 显示提示
        showAlert: function(msg, tick, callback) {
            var opt = {};
            if (typeof msg == 'object') {
                opt = msg;
            } else {
                opt.message = msg;
                opt.tick = tick;
                opt.yesCallback = callback;
            }
            if (typeof opt.showTitle != 'boolean') {
                opt.showTitle = false;
            }
            opt.type = 'alert';

            panel = panel || new Dialog();
            panel.setOptions(opt);
        },
    }

    function prevent(e) {
        e.preventDefault();
    }

    window.Dialog = new Dialog();
})()
;/**
 * 本地cookie读写
 * 读方法
 * Cookie.get();
 * Cookie.get('ABC');
 * 写方法
 * Cookie.set('ABC', 123);
 * Cookie.set('ABC', 123, 5000);
 * Cookie.set('ABC', 123, {});
 * 扩展属性包括
 * expires
 * path
 * domain
 * secure
 */
(function() {
    var Cookie = {
        /**
         * 获取某个cookie的值，如果key不则获取当前所有的cookie
         * @param key 键值
         * @return
         */
        get: function(key) {
            var result;

            if (!key) {
                result = {};
            }

            var cookies = document.cookie ? document.cookie.split('; ') : [];
            var rdecode = /(%[0-9A-Z]{2})+/g;
            var i = 0;

            for (; i < cookies.length; i++) {
                var parts = cookies[i].split('=');
                var cookie = parts.slice(1).join('=');

                if (cookie.charAt(0) === '"') {
                    cookie = cookie.slice(1, -1);
                }

                // cookie = unescape(cookie);
                cookie = cookie.replace(rdecode, decodeURIComponent);
                try {
                    cookie = JSON.parse(cookie);
                } catch (e) {}

                var name = parts[0];

                if (key === name) {
                    result = cookie;
                    break;
                }

                if (!key) {
                    result[name] = cookie;
                }
            }

            return result
        },

        /**
         * 设置cookie
         * @param key 键
         * @param value 值     
         * @param attributes 扩展属性或过期的秒数
         */
        set: function(key, value, attributes) {
            if (typeof attributes == 'number') {
                var expires = attributes;
                attributes = {
                    expires: expires
                };
            }

            attributes = extend({
                path: '/'
            }, attributes);

            attributes.expires = this._getExpires(attributes.expires);

            value = encodeURIComponent(String(value))
                        .replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
            try {
                value = JSON.stringify(value);
            } catch (e) {}

            value = escape(value);

            key = encodeURIComponent(String(key));
            key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
            key = key.replace(/[\(\)]/g, escape);

            var stringifiedAttributes = '';

            for (var attributeName in attributes) {
                if (!attributes[attributeName]) {
                    continue;
                }
                stringifiedAttributes += '; ' + attributeName;
                if (attributes[attributeName] === true) {
                    continue;
                }
                stringifiedAttributes += '=' + attributes[attributeName];
            }

            return (document.cookie = key + '=' + value + stringifiedAttributes);
        },

        /**
         * 移除cookie
         * @param key 键
         * @param attributes 扩展属性
         */
        remove: function(key, attributes) {
            this.set(key, '', extend(attributes, {
                expires: -1
            }));
        },

        /**
         * 获取失效时间
         * @param expires
         */
        _getExpires: function(expires) {
            var date = new Date();

            if (typeof expires === 'number') {
                date.setMilliseconds(date.getMilliseconds() + expires * 1e+3);
            } else if (typeof expires === 'object') {
                var d = expires.days || 0,
                    h = expires.hours || 0,
                    m = expires.minutes || 0,
                    s = expires.seconds || 0;

                if (typeof d != 'number' || typeof h != 'number' || typeof m != 'number' || typeof s != 'number') {
                    date = undefined;
                } else {
                    date.setDate(date.getDate() + parseInt(d)), date.setHours(date.getHours() + parseInt(h)), date.setMinutes(date.getMinutes() + parseInt(m)), date.setSeconds(date.getSeconds() + parseInt(s));
                }
            } else {
                date = undefined;
            }

            return date ? date.toUTCString() : '';
        }
    };

    function extend() {
        var i = 0;
        var result = {};
        for (; i < arguments.length; i++) {
            var attributes = arguments[i];
            for (var key in attributes) {
                result[key] = attributes[key];
            }
        }
        return result;
    }

    window.Cookie = Cookie;
})()
;/**
 * 本地存储扩展，主要增加一些兼容性的检测
 * 
 * 对应local的操作
 * Storage.set('ABC', 123);
 * Storage.get('ABC');
 * Storage.remove('ABC');
 *
 * 对应session的操作
 * Storage.sSet('ABC', 123);
 * Storage.sGet('ABC');
 * Storage.sRemove('ABC');
 * 
 */
(function() {
    var Storage = function() {
        this._isSupport = false; //当前系统是否支持，或者开启
        this._isSession = false; //是否使用sessionStorage

        this._init();
    }

    Storage.prototype = {
        /**
         * local:设置本地存储
         */
        set: function(key, value) {
            this._isSession = false;
            this._set(key, value);
        },

        /**
         * local:获取本地存储
         */
        get: function(key) {
            this._isSession = false;
            return this._get(key);
        },

        /**
         * local:删除本地存储
         */
        remove: function(key) {
            this._isSession = false;
            this._remove(key);
        },

        /**
         * session:设置本地存储
         */
        sSet: function(key, value) {
            this._isSession = true;
            this._set(key, value);
        },

        /**
         * session:获取本地存储
         */
        sGet: function(key) {
            this._isSession = true;
            return this._get(key);
        },

        /**
         * session:删除本地存储
         */
        sRemove: function(key) {
            this._isSession = true;
            this._remove(key);
        },

        /**
         * 初始化，识别当前是否支持或开启了本地存储
         * @return
         */
        _init: function() {
            try {
                if (!window.localStorage) {
                    this._isSupport = false;
                }
                localStorage.setItem('FORTEST', 1); //试探可否成功写入
                this._isSupport = true;
            } catch (e) {
                this._isSupport = false;
            }
        },

        /**
         * 获取本地存储对象，session或local
         * @return
         */
        _getStorage: function() {
            return this._isSession ? sessionStorage : localStorage;
        },

        /**
         * 设置本地存储
         * @param key 键
         * @param value 值
         */
        _set: function(key, value) {
            if (!this._isSupport) {
                return;
            }
            this._getStorage().setItem(key, JSON.stringify(value));
        },

        /**
         * 获取某个本地存储的key对应的值
         * @param key 键
         * @return
         */
        _get: function(key) {
            if (this._isSupport) {
                return;
            }

            var value = this._getStorage().getItem(key);

            if (value && value != 'undefined') {
                return JSON.parse(value);
            } else {
                return undefined;
            }
        },

        /**
         * 删除本地存储的某个key
         * @param key 键
         * @return
         */
        _remove: function(key) {
            if (!this._isSupport) {
                return;
            }
            this._getStorage().removeItem(key);
        }
    }

    window.Storage = new Storage();
})()
;/**
 * 使用js生成GUID
 *
 * GUID.NewGuid.ToString()
 */
(function() {

    //表示全局唯一标识符 (GUID)。
    function Guid(g) {

        var arr = new Array(); //存放32位数值的数组
        if (typeof(g) == "string") { //如果构造函数的参数为字符串
            InitByString(arr, g);
        } else {
            InitByOther(arr);
        }

        //返回一个值，该值指示 Guid 的两个实例是否表示同一个值。
        this.Equals = function(o) {

            if (o && o.IsGuid) {
                return this.ToString() == o.ToString();
            } else {
                return false;
            }

        }

        //Guid对象的标记
        this.IsGuid = function() {}

        //返回 Guid 类的此实例值的 String 表示形式。
        this.ToString = function(format) {

            if (typeof(format) == "string") {

                if (format == "N" || format == "D" || format == "B" || format == "P") {
                    return ToStringWithFormat(arr, format);
                } else {
                    return ToStringWithFormat(arr, "D");
                }
            } else {
                return ToStringWithFormat(arr, "D");

            }

        }

        //由字符串加载
        function InitByString(arr, g) {

            g = g.replace(/\{|\(|\)|\}|-/g, "");
            g = g.toLowerCase();
            if (g.length != 32 || g.search(/[^0-9,a-f]/i) != -1) {
                InitByOther(arr);
            } else {
                for (var i = 0; i < g.length; i++) {
                    arr.push(g[i]);
                }
            }
        }

        //由其他类型加载

        function InitByOther(arr) {
            var i = 32;
            while (i--) {
                arr.push("0");
            }

        }

        /**
         * 根据所提供的格式说明符，返回此 Guid 实例值的 String 表示形式。
         * @param arr 数组
         * @param format 格式
         * N  32 位： xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
         * D  由连字符分隔的 32 位数字 xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
         * B  括在大括号中、由连字符分隔的 32 位数字：{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}
         * P  括在圆括号中、由连字符分隔的 32 位数字：(xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
         */
        function ToStringWithFormat(arr, format) {

            switch (format) {

                case "N":
                    return arr.toString().replace(/,/g, "");

                case "D":
                    var str = arr.slice(0, 8) + "-" + arr.slice(8, 12) + "-" + arr.slice(12, 16) + "-" + arr.slice(16, 20) + "-" + arr.slice(20, 32);
                    str = str.replace(/,/g, "");
                    return str;

                case "B":
                    var str = ToStringWithFormat(arr, "D");
                    str = "{" + str + "}";
                    return str;

                case "P":
                    var str = ToStringWithFormat(arr, "D");
                    str = "(" + str + ")";
                    return str;

                default:
                    return new Guid();

            }

        }
    }

    //Guid 类的默认实例，其值保证均为零。
    Guid.Empty = new Guid();

    //初始化 Guid 类的一个新实例。
    Guid.NewGuid = function() {

        var g = "";
        var i = 32;
        while (i--) {
            g += Math.floor(Math.random() * 16.0).toString(16);
        }
        return new Guid(g);
    }
    window.GUID = Guid;

})();
;/**
 * 自定义弹出页，依赖jquery
 */
(function(window) {
    var tempPage = 0; //打开页面的计数，
    var SecondPage = function(options) {
        var that = this;

        if (typeof options == 'object') {
            for (var i in options) {
                that[i] = options[i];
            }
        } else if (typeof options == 'string') {
            that.targetPage = $(options);
        }
        that.coverDom = that.coverDom || $('#sidebar-bg');

        //默认点击遮罩层关闭
        that.coverDom.click(function(e) {
            e.preventDefault();
            that.closeSidebar();
        });

        if (that.coverDom.length > 0) {
            that.coverDom[0].addEventListener('touchmove', prevent, true);
        }

        if (that.targetPage.length > 0) {
            that.targetPage[0].addEventListener('touchmove', function(e){
                // e.stopPropagation();
                // e.preventDefault();
            }, false);
        }
    }

    SecondPage.prototype = {
        targetPage: undefined, //当前页面DOM
        coverDom: undefined, //遮罩层
        beforeOpen: function() {}, //打开之前
        afterClose: function() {}, //关闭之后
        openSidebar: function(fn) {
            var container = $(window),
                w = container.width(),
                h = container.height(),
                clientH = this.targetPage.height(),
                that = this;

            that.coverDom.show();
            that.targetPage.show()
                .css({
                    // 'width': w
                        // 'height': h
                });

            setTimeout(function() {
                that.targetPage.addClass('open');
            }, 100)
            tempPage++;

            if (!$('body').hasClass('move')) {
                $('body').addClass('move')
                    .css({
                        'width': document.documentElement.clientWidth,
                        'height': document.documentElement.clientHeight,
                        'overflow': 'hidden'
                    });
            }

            fn && fn();
            that.beforeOpen && that.beforeOpen();
        },

        closeSidebar: function(fn) {
            var that = this;
            this.targetPage.removeClass('open');
            tempPage--;
            setTimeout(function() {
                that.coverDom.hide();
                that.targetPage.hide();
                hasOpend = false;
                if (tempPage <= 0) {
                    $('body').removeClass('move')
                        .css({
                            'width': 'auto',
                            'height': 'auto',
                            'overflow': 'inherit'
                        });
                }
                fn && fn();
                that.afterClose && that.afterClose();
            }, 220);
        }
    }


    function prevent(e) {
        e.preventDefault();
    }

    window.SecondPage = SecondPage;
})(window)
;/**
 * 自定义验证，用于简单的校验
 */
! function() {
    /**
     * 是否含有空格或换行字符
     * @return {Boolean} [description]
     */
    String.prototype.isSpaces = function() {
        for (var i = 0; i < this.length; i += 1) {
            var ch = this.charAt(i);
            if (ch != ' ' && ch != "\n" && ch != "\t" && ch != "\r") {
                return false;
            }
        }
        return true;
    };

    /**
     * 是否是正确的邮箱地址
     * @return
     */
    String.prototype.isEmail = function() {
        return /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(this);
    };

    /**
     * 是否是正确的手机号码，1开头的11位数字
     * @return
     */
    String.prototype.isPhone = function() {
        return /^1\d{10}?$/.test(this);
    };

    /**
     * 是否为空
     * @return
     */
    String.prototype.isEmpty = function() {
        return (/^\s*$/.test(this));
    };

    /**
     * 是否正确的邮政编码，六位数字
     * @return
     */
    String.prototype.isPostCode = function() {
        return /^\d{6}?$/.test(this);
    };

    /**
     * 是否含有中文字符
     * @return
     */
    String.prototype.isZh = function() {
        return /[\u4e00-\u9fa5]+/.test(this);
    }
}()
;/**
 * 扩展模板帮助方法
 * 依赖artTemplate，tools
 */
(function(template) {
    if (!template) return;

    template.openTag = "<!--[";
    template.closeTag = "]-->";

    // 模板帮助方法，判断地址是否直辖市展示逻辑
    template.helper('$getPendingAddress', function(province, city ,district) {
        var arr = ['上海', '北京', '重庆', '天津'];
        var isCity = arr.every(function(n) {
            return n.indexOf(province) == -1;
        })
        return isCity ?  province +" "+ city : city + " " +district;
    })

    // 模板帮助方法，绝对化图片地址 空白1，
    template.helper('$absImg', function(content, defaultValue) {
        return Tools.absImg(content, defaultValue);
    });

    // 模板帮助方法，转换时间戳成字符串1
    template.helper('$formatDate', function(content, type, defaultValue) {
        return Tools.formatDate(content, type, defaultValue || '--');
    });

    //模板帮助方法，编码url参数
    template.helper('$encodeUrl', function(content) {
        return encodeURIComponent(content);
    });

    //模板帮助方法，格式化货币
    template.helper('$formatCurrency', function(content, defaultValue, unit) {
        return Tools.formatCurrency(content, defaultValue, unit);
    });

    //模板帮助方法，\r\n替换换行
    template.helper('$convertRN', function(content) {
        if (!content) {
            return '--';
        }
        return content.replace(/\r\n/gi, '<br/>');
    });

    //模板帮助方法，根据序列值添加样式名
    template.helper('$addClassByIdx', function(i, v, className) {
        if (i == v) {
            return className || '';
        }
    });

    //模板帮助方法，截取内容长度添加省略号
    template.helper('$ellipsis', function(content, length) {
        var v = content.replace(/[^\x00-\xff]/g, '__').length;
        if (v / 2 > length) {
            return content.substring(0, length) + '...';
        }
        return content;
    });

    //模板帮助方法， 从时间字符串中截取日期，限定字符串yyyy-MM-dd...
    template.helper('$getDateFromStr', function(content) {
        if (!content || content.length == 0) {
            return;
        }

        var len = content.length > 10 ? 10 : content.length;
        return content.substring(0, len);
    });

    //模板帮助方法，转换价格
    template.helper('$rbyFormatCurrency', function(content) {
        return Tools.rbyFormatCurrency(content);
    });
    
    //模板帮助方法，根据条件添加样式
    template.helper('$addClassByCondition', function(condition, className, className2) {
        if (condition) {
            return className || '';
        } else {
            return className2 || '';
        }
    });

    //模板帮助方法，获取订单状态值
    template.helper('$getOrderStatus', function(content, type) {
        return Config.ORDER_STATUS[content] || '--';
    });

    //模板帮助方法，获取用户等级名称
    template.helper('$getLevelName', function(content) {
        return Config.LEVEL[content] || '--';
    });

    // 模板帮助方法，格式化倒计时
    template.helper('$getCountDown', function(data, other, isPre, showStyle, isNewVersion) {

        if (typeof data == 'object') {
            return Tools.getRunTime(data.serverTime, data.endTime, data.isPre, data.showStyle, isNewVersion);
        } else {
            return Tools.getRunTime(data, other, isPre, showStyle, isNewVersion);
        }
    });

    // 模板帮助方法，转换微信头像，最后一个数值代表正方形头像大小（有0、46、64、96、132数值可选，0代表640*640正方形头像），用户没有头像时该项为空。若用户更换头像，原有头像URL将失效。
    template.helper('$absWechatIcon', function(content) {
        if (!content || content.indexOf('http://') != 0) return '../content/images/common/icon-group-member.png';
        //http://wx.qlogo.cn/mmopen/xxx/0
        var arr = content.split('/');
        if (arr[arr.length - 1] == '0') {
            arr[arr.length - 1] = '96';
        }
        return arr.join('/');
    });

    /*
     * 模板帮助方法，转换内容配置的target，新的java接口规则
     * @param data 内容数据，eg:{contentType: 'number', target: 'string'}
     * @return string 最终跳转的链接地址
     * 
     * contentType的值说明：
     * '1': '链接地址',
     * '2': '海外精选商品详情',
     * '3': '海外精选商品分类',
     * '4': '一起买详情',
     * '5': '专题团详情',
     * '6': '抽奖详情',
     * '7': '拼团活动页面',
     * '8': '文本',
     * '9': '首页',
     * '10': '一起买团详情,暂定搜索结果页用',
     * '11': '专题团团详情,暂定搜索结果页用',
     * '12': '秒杀团团详情,暂定搜索结果页用',
     */
    template.helper('$absUrl', function(data) {
        var url = '',
            prefix = '',
            type = data.contentType ? data.contentType : null,
            value = data.target ? data.target.toString() : '';

        if (!type || !value) {
            return "javascript:void(0)";
        }

        // 优先处理不需要值的类型跳转
        if (type == 8) {
            return "javascript:void(0)";
        }
        if (type == 9) {
            return "javascript:Go.toHome()";
        }

        // 值判断需要在不需要值的类型判断之后
        if (value.indexOf('#') == 0 || value.indexOf("javascript") == 0) {
            //约定#开头或javascript开头都设置空链接
            return "javascript:void(0)";
        }

        if (type == 2) {
            return "javascript:Go.toDetail(" + value + ")";
        }
        if (type == 3) {
            return "javascript:Go.toCategory(" + value + ")";
        }
        if (type == 7) {
            return "javascript:Go.toGroup(" + value + ")";
        }

        switch (parseInt(type)) {
            case 1:
                {
                    prefix = '';
                    url = value;
                    break;
                }
            case 4:
                {
                    prefix = '';
                    url = '/pin/group-detail.html?pinId=' + value;
                    break;
                }
            case 5:
                {
                    prefix = '';
                    url = '/group/activity-detail.html?pinId=' + value;
                    break;
                }
            case 6:
                {
                    prefix = '';
                    url = '/chou/detail.html?activityId=' + value;
                    break;
                }
            case 10:
                {
                    prefix = '';
                    url = '/pin/detail.html?groupId=' + value;
                    break;
                }
            case 11:
                {
                    prefix = '';
                    url = '/group/detail.html?groupId=' + value;
                    break;
                }
            case 12:
                {
                    prefix = '';
                    url = '/secondkill/detail.html?groupId=' + value;
                    break;
                }
            default:
                {
                    prefix = '';
                    url = '';
                    break;
                }
        }

        if (url.indexOf('http://') != 0) {
            // 不以http开头则追加上当前页面的域名
            url = Config.SHARE_HOST + url;
        }

        if (Tools.isRbyAppBrowser()) {
            prefix = prefix ? (prefix + ':') : '';

            url = prefix + url;
            if (Config.REPLACE_HOST && Config.REPLACE_HOST.length == 2) {
                //从app过来的替换域名
                return url.replace(Config.REPLACE_HOST[0], Config.REPLACE_HOST[1]);
            } else {
                return url;
            }
        } else {
            return url;
        }

    });

    // 模版帮助方法，获取最小值
    template.helper('$getIncomesType', function(content) {
        return Config.INCOMES_TYPE[content];
    });




})(window.template);
;! function() {
    window.Utils = {};
}()
;/**
 * 日期格式话
 */
(function(Utils) {

    function FormatDate() {}

    FormatDate.prototype = {
        /**
         * 时间戳格式化
         * @param content 待格式化的时间字符串
         * @param type 格式化类型
         * @param defaultValue 默认值
         * @return
         */
        format: function(content, type, defaultValue) {
            if (content == 0) {
                return '--';
            }

            var pattern = type || "yyyy-MM-dd hh:mm";
            if (isNaN(content) || content == null) {
                return defaultValue || content;
            } else if (typeof(content) == 'object') {
                var y = dd.getFullYear(),
                    m = dd.getMonth() + 1,
                    d = dd.getDate();
                if (m < 10) {
                    m = '0' + m;
                }
                var yearMonthDay = y + "-" + m + "-" + d;
                var parts = yearMonthDay.match(/(\d+)/g);
                var date = new Date(parts[0], parts[1] - 1, parts[2]);
                return this._format(date, pattern);
            } else {
                if (typeof content == 'string') {
                    content = content * 1;
                }
                if (content < 9999999999) {
                    content = content * 1000;
                }
                var date = new Date(parseInt(content));
                return this._format(date, pattern);
            }
        },

        /**
         * 字符串转换成日期对象
         * @param str 时间字符串，yyyy-MM-dd hh:mm:ss
         * @return
         */
        strToDate: function(str) {
            var tempStrs = str.split(" ");
            var dateStrs = tempStrs[0].split("-");
            var year = parseInt(dateStrs[0], 10);
            var month = parseInt(dateStrs[1], 10) - 1;
            var day = parseInt(dateStrs[2], 10);

            var timeStrs = tempStrs[1].split(":");
            var hour = parseInt(timeStrs[0], 10);
            var minute = parseInt(timeStrs[1], 10) - 1;
            var second = parseInt(timeStrs[2], 10);

            var date = new Date(year, month, day, hour, minute, second);
            return date;
        },

        /**
         * 按指定格式格式化日期
         * @param  {[type]} date 日期对象
         * @param  {[type]} pattern 格式化字符串
         * @return
         */
        _format: function(date, pattern) {
            var that = date;
            var o = {
                "M+": that.getMonth() + 1,
                "d+": that.getDate(),
                "h+": that.getHours(),
                "m+": that.getMinutes(),
                "s+": that.getSeconds(),
                "q+": Math.floor((that.getMonth() + 3) / 3),
                "S": that.getMilliseconds()
            };
            if (/(y+)/.test(pattern)) {
                pattern = pattern.replace(RegExp.$1, (that.getFullYear() + "")
                    .substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(pattern)) {
                    pattern = pattern.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return pattern;
        }
    }

    Utils.Date = new FormatDate();
})(Utils)
;/**
 * 货币格式化
 */
! function(Utils) {
    function Currency() {}

    Currency.prototype = {
        /**
         * 货币格式化，2050.5=>2,050.5
         * @param  {[type]} content      [description]
         * @param  {[type]} defaultValue [description]
         * @param  {[type]} unit         [description]
         * @return {[type]}              [description]
         */
        formatCurrency: function(content, defaultValue, unit) {
            if (!content) {
                return defaultValue || '--';
            }

            content = content + ''; //转字符串

            var prefix, subfix, idx = content.indexOf('.');
            if (idx > 0) {
                prefix = content.substring(0, idx);
                subfix = content.substring(idx, content.length);
            } else {
                prefix = content;
                subfix = '';
            }

            var mod = prefix.toString().length % 3;
            var sup = '';
            if (mod == 1) {
                sup = '00';
            } else if (mod == 2) {
                sup = '0';
            }

            prefix = sup + prefix;
            prefix = prefix.replace(/(\d{3})/g, '$1,');
            prefix = prefix.substring(0, prefix.length - 1);
            if (sup.length > 0) {
                prefix = prefix.replace(sup, '');
            }
            if (subfix) {
                if (subfix.length == 2) {
                    subfix += '0';
                } else if (subfix.length == 1) {
                    subfix += '00';
                }
                subfix = subfix.substring(0, 3);
            }
            return prefix + subfix;
        },

        /**
         * 格式化价格，显示两位小数，当两位小数都为0是省略
         * @param content 货币的字符串
         * @return
         */
        rbyFormatCurrency: function(content) {
            if (!content || isNaN(content)) return content;

            var v = parseFloat(content),
                result = v.toFixed(2);
            if (result.indexOf('.00') >= 0) {
                result = parseFloat(content).toFixed(0);
            }
            return result;
        },
    }

    Utils.Currency = new Currency();
}(Utils)
;/**
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
;/**
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
;/**
 * 工具类，包括自定义提示框、格式化日期、格式化货币、获取查询字符串、格式化表单等
 **/
(function() {
    var that = this,
        preventDefault, panel, delay, count = 0,
        toastPanel, temp;

    var Tools = {
        //绝对化图片地址
        absImg: function(content, defaultValue) {
            if (!content) {
                //图片为空时且约定传递@开头，则返回默认图
                if (defaultValue && defaultValue.indexOf('@') == 0) {
                    return Config.DEF_IMG_URL;
                }
                switch (defaultValue) {
                    case 1:
                        return Config.WHITE_IMG_URL;
                        break;
                    default:
                        return defaultValue || Config.DEF_IMG_URL;
                        break;
                }
            }

            if (typeof(content) == 'object' && content.length > 0) {
                //如果是数组则获取第一条
                content = content[0]
            }

            //测试时临时开启的替换
            if (content.indexOf('http://') == 0) {
                content = content.replace('http://img03.rbyair.com', Config.OSS_HOST);
            }

            if (content.indexOf(Config.OSS_HOST) == 0) {
                //oss过来的图片
                if (defaultValue && defaultValue.indexOf('@') == 0) {
                    //约定传递@开头的字符串拼接到阿里云图片的后面
                    content = content + defaultValue;
                }

                if (Webp.getSupport()) {
                    // 当前客户端支持或者在iosapp的251版本之后默认都开启webp，
                    content += (content.indexOf('@') != -1 ? '' : '@') + '.webp';
                }
                return content;
            } else if (content.indexOf('http://') == 0) {
                return content;
            }

            return Config.HOST_IMAGE + content;
        },
        //时间戳格式化
        _formatDate: Utils.Date.format,
        //时间戳格式化
        formatDate: function(content, type, defaultValue) {
            // 这里追加一层匿名函数，以便Utils.Date的this能指向自己
            return Utils.Date.format(content, type, defaultValue);
        },
        // 货币格式化，2050.5=>2,050.5
        formatCurrency: function(content, defaultValue, unit) {
            return Utils.Currency.formatCurrency(content, defaultValue, unit);
        },

        //格式化价格，显示两位小数，当两位小数都为0是省略
        rbyFormatCurrency: function(content) {
            return Utils.Currency.rbyFormatCurrency(content);
        },

        strToDate: function(str) {
            Utils.Date.strToDate(str);
        },

        //获取URL参数
        getQueryValue: function(key) {
            var q = location.search,
                keyValuePairs = new Array();

            if (q.length > 1) {
                var idx = q.indexOf('?');
                q = q.substring(idx + 1, q.length);
            } else {
                q = null;
            }

            if (q) {
                for (var i = 0; i < q.split("&").length; i++) {
                    keyValuePairs[i] = q.split("&")[i];
                }
            }

            for (var j = 0; j < keyValuePairs.length; j++) {
                if (keyValuePairs[j].split("=")[0] == key) {
                    // 这里需要解码，url传递中文时location.href获取的是编码后的值
                    // 但FireFox下的url编码有问题
                    return decodeURI(keyValuePairs[j].split("=")[1]);

                }
            }
            return '';
        },
        
        showConfirm: function(msg, yesCallback, noCallback){
            Dialog.showConfirm(msg, yesCallback, noCallback);
        },
        // 显示提示
        showAlert: function(msg, tick, callback) {
            Dialog.showAlert(msg, tick, callback);
        },
        // 显示加载框
        showLoading: function() {
            $('#tj-loading').show();
        },
        hideLoading: function() {
            $('#tj-loading').hide();
        },
        showToast: function(msg, tick) {
            toastPanel = toastPanel || $('#tj-toast');
            tick = tick || 4000;

            if (delay) {
                //多次点击清除动画以及定时器
                toastPanel.removeClass('show').hide();
                clearTimeout(delay);
            }

            //！。来识别，只要句子中间，就断行
            if (typeof msg !== 'string') {
                msg = JSON.stringify(msg);
            }
            msg = msg.replace(/！/g, '！<br/>');
            msg = msg.replace(/！<br\/>$/, '！');
            msg = msg.replace(/。/g, '。<br/>');
            msg = msg.replace(/。<br\/>$/, '。');
            toastPanel.find('span').html(msg);

            if (tick != 4000) {
                //设置自定义的动画时长
                toastPanel.css('animation-duration', tick / 1000 + 's');
            }
            toastPanel.addClass('show').show();
            delay = setTimeout(function() {
                toastPanel.removeClass('show');
                toastPanel.hide();
            }, tick);
        },
        isWeChatBrowser: function() {
            return Utils.Browser.isWeChatBrowser();
        },
        // 将form中的值转换为键值对
        formJson: function(form) {
            var o = {};
            var a = $(form).serializeArray();
            $.each(a, function() {
                if (o[this.name] !== undefined) {
                    if (!o[this.name].push) {
                        o[this.name] = [o[this.name]];
                    }
                    o[this.name].push(this.value || '');
                } else {
                    o[this.name] = this.value || '';
                }
            });
            return o;
        },
        alert: function(e) {
            !Cookie.get("DevDebug") ? console.log(e) : alert(e)
        },
        _GET: function() {
            var e = location.search,
                o = {};
            if ("" === e || void 0 === e) return o;
            e = e.substr(1).split("&");
            for (var n in e) {
                var t = e[n].split("=");
                o[t[0]] = decodeURI(t[1])
            }
            if (o.from) {
                delete o.code
            } //o.from得到的是什么值(类型)
            return o
        },
        removeParamFromUrl: function(e) {
            var o = Tools._GET();
            for (var n in e) delete o[e[n]];
            return location.pathname + Tools.buildUrlParamString(o)
        },
        buildUrlParamString: function(e) {
            var o = "";
            for (var n in e) o += n + "=" + e[n] + "&";
            o = o.slice(0, o.length - 1);
            var t = "" === o || void 0 === o;
            return t ? "" : "?" + o
        },
        //替换URL参数
        changeURLArg: function(url, arg, arg_val) {
            var pattern = arg + "=([^&]*)",
                replaceText = arg + "=" + arg_val;
            if (url.match(pattern)) {
                var tmp = "/(" + arg + "=)([^&]*)/gi";
                return tmp = url.replace(eval(tmp), replaceText)
            }
            return url.match("[?]") ? url + "&" + replaceText : url + "?" + replaceText
        }
    };

    window.Tools = Tools;
})();
;/**
 * 页面导航，依赖tools工具类、Jiao
 * 
 */
(function() {
    var go = {
        toHome: function() {
            if (Tools.isRbyAppBrowser()) {
                Jiao.toHome(2);
            } else {
                location.href = '../index.html';
            }
        },
        toGroup: function(pageId) {
            if (pageId) {
                url = '/group/activity.html?id=' + pageId;
            } else {
                url = '/group/activity.html';
            }
            url = Config.SHARE_HOST + url;

            if (Tools.isRbyAppBrowser()) {
                Jiao.toGroup(pageId ? url : '');
            } else {
                location.href = url;
            }
        },
        toDetail: function(productId) {
            if (Tools.isRbyAppBrowser()) {
                Jiao.toGoods(productId);
            } else {
                location.href = '../goods/goods-detail.html?productId=' + productId;
            }
        },
        toCheckout: function(addressId) {
            var param = {
                type: Tools._GET().type,
                targetId: Tools._GET().targetId,
                groupId: Tools._GET().groupId,
                addressId: addressId
            }
            var data = [];
            for (var i in param) {
                if (param[i])
                    data.push(i + '=' + param[i]);
            }
            if (Tools._GET().type == 'pin' || Tools._GET().type == 'mutiplePin') {
                location.href = '../shopping/pin-commit.html?' + data.join('&');
            } else {
                location.href = '../shopping/commit.html?' + data.join('&');
            }
        },
        toCategory: function(categoryId) {
            if (categoryId) {
                url = '/category/goods.html?categoryId=' + categoryId;
            } else {
                url = '/category/goods.html';
            }
            url = Config.SHARE_HOST + url;

            if (Tools.isRbyAppBrowser()) {
                Jiao.toCategory(categoryId ? url : '');
            } else {
                location.href = url;
            }
        },
        toBack: function() {
            // if (Tools.isRbyAppBrowser()) {
            // Jiao.toBack();
            // } else {
            history.back();
            // }
        }
    }
    window.Go = go;
})();
;/**
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
;/**
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
;/**
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
;/**
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
;/**
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
;(function(){

var html = {
	orderPush : 
		'<div class="order-push-bar">'+
		'    <a class="font-small" href="">'+
		'        <img src="" />'+
		'        <p class="inline-block">'+
		'        	<em class="order-push-msg"></em>'+
		'            <span class="float-r">1秒前</span>'+
		'        </p>'+
		'    </a>'+
		'</div>'
		
	}
	window.MEI_HTML = html
})();