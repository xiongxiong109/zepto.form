# zepto.form

 该插件基于zepto.js, 包含了form表单验证、发送手机验证码、验证码倒计时以及实现相关方法的一些子方法，均以$.fn.extends 和$.extends的方式挂载到zepto变量上, 以zeptojs插件的形式给出。

## 插件包含内容: ##

-  `$.fn.validate`  表单验证插件
-  `$.fn.getCode` 验证码倒计时插件
-  `$.lockBtn` 锁定按钮
-  `$.unlockBtn` 解锁按钮
-  `$.isBtn` 判断一个dom节点是否是`BUTTON`
-  `$.debounce` debounce函数，用于减少某些会连续触发的事件的执行次数(如`oninput`、`onresize`等)

### validate ###

使用方法：

页面部分, 写入一个正确的表单

    <form action="/" name="form" id="form">
		<input type="text" name="username">
		<input type="tel" name="mobile">
		<button type="submit">提交</button>
	</form>

引入相关的js

    <script type="text/javascript" src="../build/zepto.js"></script>
	<script type="text/javascript" src="../build/zepto.form.min.js"></script>

编写表单验证的配置信息

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

启动表单验证插件

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

#### 参数及含义: ####

**validConf**

表单验证的配置信息

<table>
	<thead>
		<tr>
			<th>参数</th>
			<th>属性</th>
			<th>含义</th>
			<th>数据类型</th>
			<th>示例</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>key</td>
			<td>required</td>
			<td>表单form中input的name属性</td>
			<td>String</td> 
			<td>username、mobile</td>
		</tr>
	</tbody>
</table>