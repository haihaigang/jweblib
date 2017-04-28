/**
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
