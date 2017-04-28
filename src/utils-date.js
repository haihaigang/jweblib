/**
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
