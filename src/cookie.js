/**
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
