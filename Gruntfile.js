module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'), // 获取json文件的配置项
		// js代码检测
		jshint: {
			options: {
				"strict": false,
				"curly": true, // 函数要用{}包裹
				"es5": true, // 使用es5标准
				"browser": true, // 基于浏览器环境
				"eqnull": true, // 
				"eqeqeq": true,
				"undef": true,
				"globals": {
					"$": true,
					"Zepto": true
				}
			},
			// 检测每一个模块的js
			qunit: ['src/*.js']
		},
		// js代码合并
		concat: {
			options: {
				stripBanners: true,
				banner: 
						'/***\n'
						+'\t@name: <%= pkg.name %>\n'
						+'\t@author: <%= pkg.author %>\n'
						+'\t@description: <%= pkg.description %>\n'
						+'\t@version: <%= pkg.version %>\n'
						+'\t@time: <%= grunt.template.today(\'yyyy-mm-dd\') \n%>'
						+'\n***/\n\n',
			},
			build: {
				src: ['src/*.js'],
				dest: 'build/zepto.form.js'
			}
		},
		// js代码压缩
		uglify: {
			target: {
				files: {
					'build/zepto.form.min.js': ['build/zepto.form.js']
				}
			}
		}
	});

	grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

}