/*common*/
// 公共方法,有可能会在全局作用域下调用

/*锁定按钮函数
@btn : 按钮对象,可以是type=submit || button的input,也可以是button标签
@txt : 锁定后标签上显示的文本
*/

$.lockBtn=function(btn, txt) {

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

$.unlockBtn=function(btn, txt) {

	var $btn = $(btn);
	$btn.removeAttr('disabled');

	if ($.isBtn($btn)) { //如果是button
		$btn.text(txt);
	} else { //如果是input
		$btn.val(txt);
	}

};

/*判断是否是button*/

$.isBtn=function(btn) {
	var nodeName = $(btn)[0].nodeName;
	return nodeName === 'BUTTON' ? true : false;
};

// debounce,减少函数的执行次数

$.debounce=function(fn, delay) {
	var timer = null;
	return function() {
		clearTimeout(timer);
		timer = setTimeout(fn, delay);
	};
};