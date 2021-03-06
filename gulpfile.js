const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  sass = require("gulp-sass"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  cssnano = require("cssnano"),
  del = require("del"),
  babel = require("gulp-babel"),
  minify = require("gulp-minify"),
  notify = require("gulp-notify"),
  uglify = require("gulp-uglify"),
  sourcemaps = require("gulp-sourcemaps"),
  concat = require("gulp-concat"),
  rename = require("gulp-rename"),
  replace = require("gulp-replace"),
  svgSymbols = require("gulp-svg-symbols"),
  svgmin = require("gulp-svgmin");

// Local server
const proxy = "http://localhost/";

// Dest paths
const paths = {
  styles: {
    src: "scss/**/*.scss",
    dest: "./"
  },
  scripts: {
    src: ["./js/*.js", "./js/libs/*.js", "./js/modules/*.js", "!./js/min/*.js"],
    dest: "./js/min"
  },
  svg: {
    src: "./icons/*.svg"
  },
  php: {
    src: [
      "./*.php",
      "./templates/*.php",
      "./includes/*.php",
      "./includes/**/*.php"
    ]
  },
  templates: {
    src: "./templates/*.php"
  }
};

/* STYLES */
function doStyles(done) {
  return gulp.series(style, done => {
    cacheBust("./style.css", "./");
    done();
  })(done);
}

function style() {
  return gulp
    .src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .on("error", function(err) {
      notify({
        title: "Wow !! You have a CSS Bug !"
      }).write(err.line + ": " + err.message);
      return this.emit("end");
    })
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

/* END STYLES */

/* SCRIPTS */
function doScripts(done) {
  return gulp.series(
    preprocessJs,
    concatJs,
    minifyJs,
    deleteArtifactJs,
    moveOptimizedScript,
    reload,
    done => {
      cacheBust("./bundle.min.js", "./");
      done();
    }
  )(done);
}

function preprocessJs() {
  return gulp
    .src(paths.scripts.src)
    .pipe(
      babel({
        presets: ["@babel/env"],
        plugins: ["@babel/plugin-proposal-class-properties"]
      })
    )
    .pipe(gulp.dest("./js/babel/"));
}

function concatJs() {
  return gulp
    .src([
      //
      "js/libs/*.js",
      "js/modules/*.js",
      //"js/libs/jquery.fitvids.js",
      //"js/libs/jquery.resizable.js",
      // "js/babel/highlighting-fixes.js",
      "js/babel/app.js"
    ])
    .pipe(concat("app-concat.js"))
    .pipe(
      uglify().on("error", function(err) {
        notify({
          title: "Wow !! You have a Javascript bug !"
        }).write(err.line + ": " + err.message);
        return this.emit("end");
      })
    )
    .pipe(gulp.dest("./js/concat/"));
}

function minifyJs() {
  return gulp
    .src(["./js/babel/*.js", "./js/concat/*.js"])
    .pipe(
      minify({
        ext: {
          src: ".js",
          min: ".min.js"
        }
      })
    )
    .pipe(gulp.dest(paths.scripts.dest));
}

function deleteArtifactJs() {
  return del([
    "./js/babel",
    "./js/concat",
    "./js/min/*.js",
    "!./js/min/*.min.js"
  ]);
}

function moveOptimizedScript() {
  return gulp
    .src("./js/min/app-concat.min.js")
    .pipe(rename("bundle.min.js"))
    .pipe(gulp.dest("./"));
}

/* END SCRIPTS */

/* SVG */
function doSvg() {
  return gulp
    .src(paths.svg.src)
    .pipe(svgmin())
    .pipe(
      svgSymbols({
        templates: ["default-svg"],
        svgAttrs: {
          width: 0,
          height: 0,
          display: "none"
        }
      })
    )
    .pipe(rename("icons/sprite/icons.php"))
    .pipe(gulp.dest("./"));
}
/* END SVG */

/* GENERIC THINGS */
function cacheBust(src, dest) {
  var cbString = new Date().getTime();
  return gulp
    .src(src)
    .pipe(
      replace(/cache_bust=\d+/g, function() {
        return "cache_bust=" + cbString;
      })
    )
    .pipe(gulp.dest(dest));
}

function reload(done) {
  browserSync.reload();
  done();
}

function watch() {
  browserSync.init({
    proxy: proxy
  });
  gulp.watch(paths.styles.src, doStyles);
  gulp.watch(paths.scripts.src, doScripts);
  gulp.watch(paths.svg.src, doSvg);
  gulp.watch(paths.php.src, reload);
  gulp.watch(paths.templates.src, done => {
    cacheBust("./js/app.js", "./js/");
    done();
  });
}

gulp.task("default", watch);
