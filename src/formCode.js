/*获取验证码并倒计时,
  方法扩展到获取验证码的点击按钮上
  @ bind:#id需要绑定验证的input框,只有当input框验证通过时,获取验证码的按钮才可以被点击
  @ validReg    : RegExp   需要验证的input值的正则表达式
  @ countTime   : number   验证码倒计时秒数
  @ debounce    : number   输入input验证的延迟响应值
  @ countTag    : string   本地存储所存下计时时间戳的标签
  @ needRefresh : boolean  页面刷新时是否需要刷新计时器,默认是不刷新计时器
  @ defaultTxt  : string   获取验证码按钮的状态值
  @ touch       : boolean  是否使用触摸事件
  @ insertStr   : str      验证码倒计时的前置字符串
  @ appendStr   : str      验证码倒计时的后置字符串
  @ sendCode    : function[value]
                           点击发送验证码的发送回调函数
                           value: bind的input所对应的值,
                           函数中的this指向发送验证码按钮
*/
;(function($) {
	$.fn.getCode = function(opt) {

		var defaults = {
			"countTime": 180,
			"countTag": 'countTime',
			"bind": "#mobile",
			"validReg": /(.*)+/,
			"defaultTxt": "获取验证码",
			"needRefresh": false,
			"debounce": 100,
			"touch": true,
			"insertStr": "等待",
			"appendStr": "秒后,再次获取",
			"sendCode": function() {}
		};
		opt = $.extend(defaults, opt || {});

		var $ipt = $(opt.bind),
			$code = $(this),
			countTimer = null;

		$.lockBtn($code, opt.defaultTxt);

		if (!opt.needRefresh) { //如果刷新页面不需要刷新计时器,则页面加载完成后就开始计时
			countTime();
		}else{
			window.localStorage.removeItem(opt.countTag);
		}

		/*验证输入框的值*/
		var _validValue = $.debounce(validValue, opt.debounce);
		validValue();
		$ipt.on('input', _validValue);

		/*获取验证码按钮*/
		var clickEv = opt.touch ? "tap" : "click";

		$code.on(clickEv, function() {

			var $target = $(this);
			var isLocked = $target.is(':disabled');
			if (!isLocked) {
				// 设置倒计时时间
				window.localStorage.setItem(opt.countTag, new Date().getTime());
				$.lockBtn($code, getStr(opt.countTime));
				countTime(); //计时
				opt.sendCode.call($code, $ipt.val()); //发送验证码
			}

		});

		/*验证输入值函数*/

		function validValue() {
			//验证输入值
			var rst = opt.validReg.test($ipt.val());

			//通过localStorage的存储的时间戳来判断是否正在倒计时
			var isCounted = window.localStorage.getItem(opt.countTag);

			if (!isCounted) { //判断是否正在倒计时
				if (!rst) {
					$.lockBtn($code, opt.defaultTxt);
				} else {
					$.unlockBtn($code, opt.defaultTxt);
				}
			}
		}
		/*计时函数*/

		function countTime() {

			var storeTime = window.localStorage.getItem(opt.countTag);
			clearInterval(countTimer);
			subCount();
			countTimer = setInterval(subCount, 1e3);

			function subCount() {
				var curTime = new Date().getTime();
				var disTime = opt.countTime - Math.floor((curTime - storeTime) / 1000);
				if (disTime <= 0) { //计时结束
					window.localStorage.removeItem(opt.countTag);
					$.unlockBtn($code, opt.defaultTxt);
					validValue();
				} else {
					$code.val( getStr(disTime) );
				}
			}

		}

		/*拼接验证码倒计时显示的字符串
			@num : 倒计时秒数 
			将倒计时的秒数前后接上配置项中的前置字符串与后置字符串
		*/

		function getStr(num) {
			return [opt.insertStr, num, opt.appendStr].join('');
		}
	};
})(Zepto);