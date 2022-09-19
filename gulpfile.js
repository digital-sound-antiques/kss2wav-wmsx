const gulp = require("gulp");
const concat = require('gulp-concat');

gulp.task("default", function () {
    return gulp.src([
        'src/mock.js',
        'webmsx/src/main/WMSX.js',
        'webmsx/src/main/util/Util.js',
        'webmsx/src/main/msx/audio/PSG.js',
        'webmsx/src/main/msx/audio/PSGAudio.js',
        'webmsx/src/main/msx/audio/YM2413Tables.js',
        'webmsx/src/main/msx/audio/YM2413Audio.js',
        'src/index.js'
    ]).pipe(concat('bundle.js'))
        .pipe(gulp.dest('dist/'));
});