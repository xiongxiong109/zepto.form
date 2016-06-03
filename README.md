# zepto.form

 该插件基于zepto.js, 包含了form表单验证、发送手机验证码、验证码倒计时以及实现相关方法的一些子方法，均以$.fn.extends 和$.extends的方式挂载到zepto变量上, 以zeptojs插件的形式给出。

## 插件包含内容: ##

-  `$.fn.validate`  表单验证插件
-  `$.fn.getCode` 验证码倒计时插件
-  `$.lockBtn` 锁定按钮
-  `$.unlockBtn` 解锁按钮
-  `$.isBtn` 判断一个dom节点是否是`BUTTON`
-  `$.debounce` debounce函数，用于减少某些会连续触发的事件的执行次数(如`oninput`、`onresize`等)

## validate插件 ##

使用方法：

页面部分, 写入一个正确的表单

```html
    <form action="/" name="form" id="form">
		<input type="text" name="username">
		<input type="tel" name="mobile">
		<button type="submit" disabled>提交</button>
	</form>
```

引入相关的js

```html
    <script type="text/javascript" src="../build/zepto.js"></script>
	<script type="text/javascript" src="../build/zepto.form.min.js"></script>
```

编写表单验证的配置信息

```js
    var validConfig = {
			username: {
				required: false,
				reg: {
					exp: /^[\w\u4e00-\u9fa5]+$/,
					msg: '姓名不能包含特殊字符'
				}
			},
			mobile: {
				required: '手机号码不能为空',
				reg: {
					exp: /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/,
					msg: '请输入正确的手机号码'
				}
			}
		} 
```

启动表单验证插件

```js
    $("#form").validate({
			validConf: validConfig,
			touch: false,
			loadingTxt: '正在提交...',
			defaultTxt: '登录',
			alertFn: alert, // 弹窗提示函数
			validSuccess: function(json) {
				console.log(this);
				console.log(json);
			}
		});
```

#### 参数及含义: ####

**validConf**

表单验证的配置信息

<table>
	<thead>
		<tr>
			<th>参数</th>
			<th rowspan="3">属性</th>
			<th>含义</th>
			<th>数据类型</th>
			<th>示例</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>key</td>
			<td>required、reg</td>
			<td>表单form中input的name属性</td>
			<td>String</td> 
			<td>username、mobile</td>
		</tr>
	</tbody>
</table>

```js
    username: { // input的name值
            required: false, // 表示该字段是否为必填, 默认为true
            reg: { // 该字段在表单提交时验证的正则
                exp: /^[\w\u4e00-\u9fa5]+$/, // 验证的正则表达式
                msg: '姓名不能包含特殊字符' // 正则不匹配时的提示文字
            }
        },
```

**touch**

是否使用touch事件来处理表单的点击,默认为true

**注意**: 如果要使用该属性,则[zepto.js](https://github.com/madrobby/zepto "zepto.js")需要引入[touch](https://github.com/madrobby/zepto/blob/master/src/touch.js "touch.js")插件, 因为这里是使用的zepto的tap事件做的touch。

**loadingTxt**

表单验证通过时,zepto.form会改变提交按钮的状态为disabled, 并修改按钮的文字内容(如果是`button`则修改`innerHTML`, 如果是`input[type="submit"]`则会修改value);loadingTxt就是提交时的显示内容,默认为"正在提交"。

**defaultTxt**

提交按钮的默认文本内容,默认为"提交"。

**alertFn**

验证不通过时会弹出对应的`key.reg.msg`的提示文本,而弹出方法则是调用`alertFn(msg)`弹出，
这里的`alertFn`默认使用的是`window.alert`函数,如果你有自己的弹框函数，则可以直接接入进来,
比如，

	{
		...
		alertFn: function(msg) {
			console.log(msg);
		}
		...
	}

再比如，使用其他的弹框插件，如我的另一个zepto弹框插件[$.showOverlay](https://github.com/xiongxiong109/plugin_commonFn/blob/master/js/plugins/zepto.overlay.js "zepto弹框"),那么就可以这样配置

	{
		...
		alertFn: $.showOverlay
		...
	}

这样的话，提示文字就会以其他自定义弹框样式的形式显示出来。

**validSuccess**

传入一个回调函数。表单中所有需要验证的字段都验证通过后，就会执行该函数
该函数的参数`json`就是表单中所有存在值的`input`的`name` : `value`所构成的一个对象。
函数中的`this`指向form表单的提交按钮(这样做的原因是，表单在前端验证通过后，提交按钮会变成`disabled`,然后在`validSuccess`函数中进行相关的操作,如ajax提交表单等，操作完成后可能需要将按钮的状态还原,这时`this`指向了提交按钮, 然后就可以直接调用`$.unlockBtn`来解锁按钮了)。

## getCode插件 ##

获取验证码倒计时插件，这个插件会绑定一个获取验证码的按钮和一个input输入框的value，当value符合一定条件的时候,获取验证码的按钮才能点击获取。使用方法：

需要两个输入框

```html
    <input type="tel" name="mobile" id="mobile">
	<input type="button" id="getCode" value="获取验证码">
```

引入js

```html
	<script type="text/javascript" src="../build/zepto.js"></script>
	<script type="text/javascript" src="../build/zepto.form.min.js"></script>
```

调用插件

```js
	`$("#getCode").getCode({
			"bind": "#mobile",
			"validReg": /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/,
			"countTime": 180,
			"countTag": 'countTime',
			"defaultTxt": "获取验证码",
			"needRefresh": false,
			"debounce": 100,
			"touch": true,
			"insertStr": "等待",
			"appendStr": "秒后,再次获取",
			"sendCode": function(v) {
				console.log(v);
			}
		});`
```

各个参数及含义

<table>
	<thead>
		<tr>
			<th>参数</th>
			<th>类型</th>
			<th>含义</th>
			<th>默认值</th>
			<th>示例</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>bind</td>
			<td>String</td>
			<td>按钮所需要绑定的对应元素,$(selector)进行元素获取</td>
			<td>"#mobile"</td>
			<td>"#mobile"</td>
		</tr>
		<tr>
			<td>validReg</td>
			<td>regExp</td>
			<td>对绑定value进行验证的正则表达式</td>
			<td>/(.*)+/</td>
			<td>/^[\w\u4e00-\u9fa5]+$/</td>
		</tr>
		<tr>
			<td>countTime</td>
			<td>Number</td>
			<td>倒计时的时长[s]</td>
			<td>180</td>
			<td>90</td>
		</tr>
		<tr>
			<td>countTag</td>
			<td>String</td>
			<td>倒计时在本地存储中的keyname(这里使用localStorage存储计时变量)</td>
			<td>countTime</td>
			<td>codeCountTag</td>
		</tr>
		<tr>
			<td>defaultTxt</td>
			<td>String</td>
			<td>获取验证码的默认按钮文本</td>
			<td>获取验证码</td>
			<td>立即获取</td>
		</tr>
		<tr>
			<td>needRefresh</td>
			<td>Boolean</td>
			<td>刷新页面后是否重置倒计时</td>
			<td>true</td>
			<td>false</td>
		</tr>
		<tr>
			<td>debounce</td>
			<td>Number</td>
			<td>监听bind输入框输入事件的响应频率(会用到$.debounce函数)</td>
			<td>100[ms]</td>
			<td>50[ms]</td>
		</tr>
		<tr>
			<td>touch</td>
			<td>Boolean</td>
			<td>是否使用触摸事件(需要zepto touch.js支持)</td>
			<td>true</td>
			<td>false</td>
		</tr>
		<tr>
			<td>insertStr</td>
			<td>String</td>
			<td>按钮前插字符串</td>
			<td>等待</td>
			<td>(</td>
		</tr>
		<tr>
			<td>appendStr</td>
			<td>String</td>
			<td>按钮后插字符串</td>
			<td>秒后,再次获取</td>
			<td>s)后获取</td>
		</tr>
		<tr>
			<td>sendCode</td>
			<td>Function</td>
			<td>点击发送验证码按钮的回调函数</td>
			<td>function() {}</td>
			<td>function(v) {console.log(v); // 这里的v就是bind绑定的数值}</td>
		</tr>
	</tbody>
</table>

**说明:**
按钮点击后开始倒计时, 倒计时的数值会以秒的形式呈现在按钮上,如`100`, 然后可以通过设置insertStr 与 appendStr的值，使之显示出不同的倒计时文本
假如设置如下:

```js	
	{
		insertStr:(,
		appendStr:s)后再次获取,
	}
```

则倒计时时的提示文字就会变成`(`**15**`s)后再次获取`

## 其他子函数 ##

其他子函数可以直接参考[formCommon.js](https://github.com/xiongxiong109/zepto.form/blob/master/src/formCommon.js "formCommon")中源码的调用方式

```js
    $.debounce(fn, delay);
	$.lockBtn(btn, str);
	$.unlockBtn(btn, str);
```

示例[demo](https://github.com/xiongxiong109/zepto.form/tree/master/example "demons")