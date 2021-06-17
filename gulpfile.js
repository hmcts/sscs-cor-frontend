const gulp = require('gulp');

function copyCookieBanner() {
  gulp.task('test', async() => {
    await gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/**/*.js'])
      .pipe(gulp.dest('./app/client/js/'));

    await gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/**/*.njk'])
      .pipe(gulp.dest('./views/cookie-manager/'));

    await gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/button/**/*.*'])
      .pipe(gulp.dest('./views/button/'));

    await gulp.src(['./node_modules/cmc-cookies-manager/shared-component/components/cookie-banner/**/*.*'])
      .pipe(gulp.dest('./views/cookie-banner/'));
  });
}

exports.test = copyCookieBanner;
