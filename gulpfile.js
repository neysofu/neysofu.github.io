const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const browserSync = require('browser-sync').create();
const cp = require('child_process');
const imagemin = require('gulp-imagemin');
const eslint = require('gulp-eslint');
const uglify = require('gulp-uglify');
const prefix = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');

const jsPath = '_scripts/*.js';
const jsDestPath = '_site/js';

const imgPath = 'img/**/*.+(png|jpg|gif|svg)';
const imgDestPath = '_site/img';

const jekyll = process.platform === 'win32' ? 'jekyll.bat' : 'jekyll';

const scssPath = '_scss/**/*.scss';
const templatePath = [
  '*.html',
  '+(_includes|_layouts)/*.html',
  '*.yml',
  '_data/*.yml',
  '_posts/*',
];

gulp.task('sass', () => {
  return gulp
    .src(scssPath)
    .pipe(
      sass({
        includePaths: ['scss'],
        outputStyle: 'expanded',
      })
    )
    .pipe(
      prefix({
        overrideBrowserslist: ['last 2 versions'],
        cascade: false,
      })
    )
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(gulp.dest(jsDestPath))
    .pipe(gulp.dest('css'));
});

gulp.task('scripts', () => {
  return (
    gulp
      .src(jsPath)
      .pipe(
        eslint({
          useEslintrc: true,
        })
      )
      .pipe(eslint.format())
      // .pipe(uglify())
      .pipe(gulp.dest(jsDestPath))
      .pipe(gulp.dest('js'))
  );
});

gulp.task('images', () => {
  return gulp
    .src(imgPath)
    .pipe(imagemin())
    .pipe(gulp.dest(imgDestPath));
});

const reloadBrowser = done => {
  browserSync.reload();
  done();
};

// run `jekyll build`
gulp.task('jekyll-build', done => {
  return cp.spawn(jekyll, ['build'], { stdio: 'inherit' }).on('close', done);
});

// run `jekyll build` with _config_dev.yml
gulp.task('jekyll-dev', done => {
  return cp
    .spawn(jekyll, ['build', '--config', '_config.yml,_config_dev.yml'], {
      stdio: 'inherit',
    })
    .on('close', done);
});

// Rebuild Jekyll then reload the page
gulp.task('jekyll-rebuild', gulp.series(['jekyll-dev', reloadBrowser]));

gulp.task(
  'serve',
  gulp.series('jekyll-dev', () => {
    browserSync.init({
      server: {
        baseDir: '_site',
      },
    });

    gulp.watch(scssPath, gulp.series(['sass', reloadBrowser]));
    gulp.watch(jsPath, gulp.series(['scripts', reloadBrowser]));
    gulp.watch(templatePath, gulp.task('jekyll-rebuild'));
  })
);

gulp.task('build', gulp.series(['sass', 'scripts', 'images', 'jekyll-build']));
