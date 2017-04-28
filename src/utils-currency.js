/**
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
