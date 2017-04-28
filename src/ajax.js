/**
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
