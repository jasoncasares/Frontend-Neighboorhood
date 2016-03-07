var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var minifyInline = require('gulp-minify-inline');
 
gulp.task('minify', function() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist/'))
});

gulp.task('minify-inline', function() {
  gulp.src('src/*.html')
    .pipe(minifyInline())
    .pipe(gulp.dest('dist/'))
});

gulp.task('default', ['minify-inline', 'minify']);
