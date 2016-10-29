var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs');

var jsSrc = ['./src/client/**/*.js', './src/client/*.js'];

gulp.task('validateJs', function(){
   return gulp.src(jsSrc)
       .pipe(jscs())
       .pipe(jshint())
       .pipe(jshint.reporter('jshint-stylish'));

});
