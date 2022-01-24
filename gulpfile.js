let gulpfile = require("gulp");
let pug = require("gulp-pug");
let sass = require("gulp-sass");
let postcss = require("gulp-postcss");
let rollup = require("rollup");
let resolve = require("rollup-plugin-node-resolve");
let babel = require("rollup-plugin-babel");
var browserSync = require("browser-sync").create();
// let postcssRem = require("postcss-pixels-to-rem");

gulpfile.task("build:pug", () => {
  return gulpfile
    .src("src/pug/*.pug")
    .pipe(
      pug({
        pretty: true,
      })
    )
    .pipe(gulpfile.dest("build"));
});

gulpfile.task("build:scss", () => {
  // var plugins = [
  //   postcssRem({
  //     base: 16,
  //     unit: "rem",
  //     mediaQueries: false,
  //   }),
  // ];
  return gulpfile
    .src("src/scss/*.scss")
    .pipe(sass().on("error", sass.logError))
    // .pipe(postcss(plugins))
    .pipe(gulpfile.dest("build/css"));
});

gulpfile.task("build:js", () => {
  return rollup
    .rollup({
      input: "src/js/main.js",
      plugins: [
        resolve(),
        babel({
          exclude: "node_modules/**",
        }),
      ],
    })
    .then((bundle) => {
      return bundle.write({
        file: "build/js/main.js",
        format: "iife",
      });
    });
});

gulpfile.task("build:img", () => {
  return gulpfile
    .src("src/img/**/*", {
      allowEmpty: true,
    })
    .pipe(gulpfile.dest("build/img"));
});

gulpfile.task("build:resources", () => {
  return gulpfile
    .src("src/resources/**/*", {
      dot: true,
      allowEmpty: true,
    })
    .pipe(gulpfile.dest("build"));
});

gulpfile.task(
  "build",
  gulpfile.parallel(
    "build:pug",
    "build:scss",
    "build:js",
    "build:img",
    "build:resources"
  )
);

gulpfile.task("serve", () => {
  browserSync.init({
    server: {
      baseDir: "build",
    },
  });
});

gulpfile.task("watch", () => {
  gulpfile.watch("src/pug/**/*.pug", gulpfile.series("build:pug"));
  gulpfile.watch("src/scss/**/*.scss", gulpfile.series("build:scss"));
  gulpfile.watch("src/js/**/*.js", gulpfile.series("build:js"));
  gulpfile.watch("src/img/**/*", gulpfile.series("build:img"));
  gulpfile.watch(
    ["src/resources/**/*", "src/resources/**/.*"],
    gulpfile.series("build:resources")
  );
  gulpfile.watch("build/**/*").on("change", browserSync.reload);
});

gulpfile.task(
  "default",
  gulpfile.series("build", gulpfile.parallel("serve", "watch"))
);
