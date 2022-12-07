// eslint-disable-next-line @typescript-eslint/no-var-requires
const gulp = require('gulp');

const assetsDirectory = './cookie-banner/public';
const stylesheetsDirectory = `${assetsDirectory}/stylesheets`;

function copyCookieBanner(done) {
  gulp
    .src([
      './node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/**/*.js',
    ])
    .pipe(gulp.dest(`${assetsDirectory}/js/`));

  gulp
    .src([
      './node_modules/cmc-cookies-manager/shared-component/components/cookie-manager/cookies-manager.js',
    ])
    .pipe(gulp.dest('./public/js/'));

  gulp
    .src([
      './node_modules/cmc-cookies-manager/shared-component/components/styles/**/*.css',
    ])
    .pipe(gulp.dest(`${stylesheetsDirectory}/`));

  gulp
    .src([
      './node_modules/jquery/dist/jquery.min.js',
      './node_modules/govuk_template_jinja/assets/javascripts/**/*.js',
    ])
    .pipe(gulp.dest(`${assetsDirectory}/js/lib/`));
  done();
}

exports.default = copyCookieBanner;
