/**
 * 倒计时
 */
(function(Utils) {
    var Countdown = {
        getRunTime: function(systemTime, endTime, isPre, showStyle, isNewVersion) {
            if (!systemTime || isNaN(systemTime) || !endTime || isNaN(endTime)) {
                return '数据错误';
            }

            var showTime = parseInt(endTime) - parseInt(systemTime);

            var aft = '',
                bef = '';
            switch (isPre) {
                case 1:
                    {
                        bef = '还有'
                        aft = '开始';
                        break;
                    }
                case 2:
                    {
                        bef = '剩余'
                        aft = '开奖';
                        break;
                    }
                case 3:
                    {
                        aft = '后开始';
                        break;
                    }
                case 4:
                    {
                        aft = '后抢购结束';
                        break;
                    }
                case 5:
                    {
                        aft = '后结束';
                        break;
                    }
                case 6:
                    {
                        bef = '还剩'
                        aft = '活动开始';
                        break;
                    }
                case 7:
                    {
                        bef = '还剩'
                        aft = '活动结束';
                        break;
                    }
                case 8:
                    {
                        bef = '仅剩'
                        aft = '';
                        break;
                    }
                default:
                    {
                        bef = '剩余'
                        aft = '结束';
                        break;
                    }
            }

            if (showTime <= 0) {
                return '已结束';
            }
            var nD = Math.floor(showTime / (60 * 60 * 24));
            var nH = Math.floor(showTime / (60 * 60)) % 24;
            var nM = Math.floor(showTime / 60) % 60;
            var nS = Math.floor(showTime) % 60;
            if (systemTime > 9999999999) {
                nD = Math.floor(showTime / (60 * 60 * 24 * 1000));
                nH = Math.floor(showTime / (60 * 60 * 1000)) % 24;
                nM = Math.floor(showTime / (60 * 1000)) % 60;
                nS = Math.floor(showTime / 1000) % 60;

            }
            if (showStyle == 0) {
                if (nD == 0) {
                    return bef + ' <span><em>' + Tools.checkTime(nH) + '</em>:<em>' + Tools.checkTime(nM) + '</em>:<em>' + Tools.checkTime(nS) + '</em> </span> ' + aft;
                } else {
                    return bef + ' <span><em>' + Tools.checkTime(nD) + '</em> 天 <em>' + Tools.checkTime(nH) + '</em>:<em>' + Tools.checkTime(nM) + '</em>:<em>' + Tools.checkTime(nS) + '</em> </span> ' + aft;
                }
            } else if (showStyle == 2) {
                return ' <span><em>' + Tools.checkTime(nD * 24 + nH) + '</em> <em>' + Tools.checkTime(nM) + '</em> <em>' + Tools.checkTime(nS) + '</em> </span>';
            } else if (showStyle == 3 && isNewVersion) {
                if (nD == 0) {
                    return bef + ' ' + Tools.checkTime(nH) + '时' + Tools.checkTime(nM) + '分' + Tools.checkTime(nS) + '秒 ' + aft;
                } else {
                    return bef + ' ' + Tools.checkTime(nD) + '天' + Tools.checkTime(nH) + '时' + Tools.checkTime(nM) + '分' + Tools.checkTime(nS) + '秒 ' + aft;
                }
            } else if (showStyle == 4) {
                return bef + ' ' + (Number(Tools.checkTime(nH)) + nD * 24) + ':' + Tools.checkTime(nM) + ':' + Tools.checkTime(nS) + aft;

            } else {
                if (nD == 0) {
                    return bef + ' <span><em>' + Tools.checkTime(nH) + '</em>时<em>' + Tools.checkTime(nM) + '</em>分<em>' + Tools.checkTime(nS) + '</em>秒</span> ' + aft;
                } else {
                    return bef + ' <span><em>' + Tools.checkTime(nD) + '</em>天<em>' + Tools.checkTime(nH) + '</em>时<em>' + Tools.checkTime(nM) + '</em>分<em>' + Tools.checkTime(nS) + '</em>秒</span> ' + aft;
                }
            }
        },
        checkTime: function(i) { //时分秒为个位，用0补齐
            if (i < 10) {
                i = "0" + i;
            }
            return i;
        },
    }

    Utils.Countdown = Countdown;
})(Utils)
