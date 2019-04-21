const gulp = require('gulp');
const sass = require('gulp-sass');
const webpack = require('gulp-webpack');

const sassFunc = () => {
    return gulp.src('client/src/scss/main.scss')
        .pipe(sass()) // Using gulp-sass
        .pipe(gulp.dest('client/dist'))
}
gulp.task('sass', sassFunc);

gulp.task('js', function() {
    return gulp.src('client/src/js/main.js')
        .pipe(webpack({output: {filename:'main.js'}}))
        .pipe(gulp.dest('client/dist'));
});

gulp.task('watch', ()=>{
    gulp.watch('client/src/scss/**/*.scss', gulp.series('sass')); 
    gulp.watch('client/src/js/**/*.js', gulp.series('js')); 
});

gulp.task('default', gulp.series('sass', 'js', 'watch'));