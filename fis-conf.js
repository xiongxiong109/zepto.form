fis.media('release')
.match('zepto.form.js',{
	optimizer:fis.plugin('uglify-js'),
	release:'./dist/zepto.form.min.js'
});