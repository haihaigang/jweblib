/**
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
