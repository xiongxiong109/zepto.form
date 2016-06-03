/*
	验证码倒计时(刷新页面是否同时刷新计时器,计时变量由localStorage来实现)
  @ validConf      : obj      验证规则,有required与reg,必填项和正则匹配项
  @ touch          : boolean  是否使用触摸事件
  @ loadingTxt     : string   提交时提交按钮显示的文本
  @ defaultTxt     : string   提交的默认显示文本
  @ validSuccess   : function[json]
                     表单验证通过后执行的回调函数,一般在这里调用ajax,
                     函数的参数为表单序列化后的json格式,
                     函数中的this指向input[submit]提交按钮
  @ alertFn        : function[str]
                     弹窗提示函数,默认使用window的alert弹窗,也可以传入自己的弹窗函数
*/

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
						if(key.required !== false){ //判断是否为必填项
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