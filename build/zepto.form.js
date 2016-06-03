/***
	@name: zepto.form
	@author: xiongxiong109
	@description: 基于zepto的表单插件，包括表单验证、发送验证码、验证码倒计时等
	@version: 1.2.0
	@time: 2016-06-03
***/

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
		} else {
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
					$code.val(getStr(disTime));
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
// 公共方法,有可能会在全局作用域下调用

/*锁定按钮函数
@btn : 按钮对象,可以是type=submit || button的input,也可以是button标签
@txt : 锁定后标签上显示的文本
*/

$.lockBtn = function(btn, txt) {

	var $btn = $(btn);
	$btn.attr('disabled', 'disabled');

	if ($.isBtn($btn)) { //如果是button
		$btn.text(txt);
	} else { //如果是input
		$btn.val(txt);
	}

};

/*解锁按钮函数
@btn : 按钮对象,可以是type=submit || button的input,也可以是button标签
@txt : 锁定后标签上显示的文本
*/

$.unlockBtn = function(btn, txt) {

	var $btn = $(btn);
	$btn.removeAttr('disabled');

	if ($.isBtn($btn)) { //如果是button
		$btn.text(txt);
	} else { //如果是input
		$btn.val(txt);
	}

};

/*判断是否是button*/

$.isBtn = function(btn) {
	var nodeName = $(btn)[0].nodeName;
	return nodeName === 'BUTTON' ? true : false;
};

// debounce,减少函数的执行次数

$.debounce = function(fn, delay) {
	var timer = null;
	return function() {
		clearTimeout(timer);
		timer = setTimeout(fn, delay);
	};
};
//表单验证
;(function($) {
	$.fn.validate = function(opt) {

		var defaults = {
			"validConf": {},
			/*表单验证正则*/
			"touch": true,
			/*提交是否要处理300ms的点击延迟*/
			"loadingTxt": "正在提交",
			"defaultTxt": "提交",
			"validSuccess": function(json) {},
			/*提交后的提交按钮显示*/
			"alertFn": window.alert /*弹窗函数,默认使用原生alert弹窗,如果有自己编写的弹窗,则在这里传入弹窗函数即可,弹窗函数需要接受字符串参数*/
		};
		opt = $.extend(defaults, opt || {});

		var $form = $(this);
		if ($form[0].nodeName !== 'FORM') { //调用该函数的标签必须是一个form标签

			throw new Error('the element must be a form');
			// return false;

		} else {

			var $smt = $form.find('[type="submit"]');
			/*初始化表单验证*/
			initValid();

		}

		/*表单验证初始化函数
		获取dom,绑定事件
		*/

		function initValid() {
			$.unlockBtn($smt, opt.defaultTxt);

			if (opt.touch) { //如果需要处理移动端300ms延迟,则使用tap代替click提交(需要zepto的tap插件)
				$smt.on('click', prevent).on('tap', function() {
					if (!$(this).is(':disabled')) {
						submit();
					}
				});
			}

			/*监听form提交事件,验证表单,验证通过后提交表单*/
			$form.on('submit', function(e) {
				prevent(e);

				if (validForm($form)) {
					$.lockBtn($smt, opt.loadingTxt); //锁住提交按钮
					submitForm($form);
				}

			});

		}

		/*取消事件默认行为函数*/

		function prevent(e) {
			e.preventDefault();
		}

		/*触发表单提交*/

		function submit() {
			$form.trigger('submit');
		}


		/*表单验证函数

		@:验证的逻辑是根据input的name与validConf的key相对应的值的验证,
			默认所有需要验证的字段都不能为空,即required, 如果该项不是必填项,需要设置required=false
			required验证会弹出对应的提示字符串,
			正则验证则写在对应的reg属性中,reg属性又有两个属性,
			目前只做了一个正则的验证,后期可以考虑做多个正则的验证
			reg:{
				exp:对应正则表达式,
				msg:对应匹配错误提示
			}

		@:表单验证配置示例:
			validConf={
				'mobile':{ //对应input的[name]属性
					'required':'手机号码不能为空', 
					'reg':{
						'exp':/^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/,
						'msg':'请输入正确的手机号码'
					}
				}
			}

		*/

		function validForm($form) {
			var arr = $form.serializeArray();

			for (var i = 0; i < arr.length; i++) {

				var key = opt.validConf[arr[i].name];
				var v = arr[i].value;

				if (key) {
					if (v === '') { //判断是否为空
						if (key.required !== false) { //判断是否为必填项
							opt.alertFn.call(null, key.required);
							return false;
						}
					} else {
						if (key.reg) { //如果有正则需要验证，则验证正则表达式
							if (!key.reg.exp.test(v)) {
								opt.alertFn.call(null, key.reg.msg);
								return false;
							}
						}
					}
				}
			}
			return true;
		}

		//表单提交数据处理

		function submitForm($form) {

			var arr = $form.serializeArray();
			var json = {};
			$.each(arr, function(idx, obj) {
				json[obj.name] = obj.value;
			});

			/*调用验证通过后的回调函数*/
			opt.validSuccess.call($smt, json);

		}

	};

})(Zepto);