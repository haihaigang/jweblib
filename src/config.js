/**
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
