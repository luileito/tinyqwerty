module.exports = function(grunt) {

  var DEBUG = !!grunt.option('debug');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
      common: {
        sourceMap: DEBUG,
        files: {
          './common/log.min.js': [ './common/src/log.js' ],
          './common/url.min.js': [ './common/src/url.js' ],
        }
      },
      zoomboard: {
        options: {
          sourceMap: DEBUG,
          banner: '/*! <%= pkg.name %> ZoomBoard keyboard <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          './zoomboard/widget.min.js': [ './zoomboard/src/widget.js' ],
          './zoomboard/keys.min.js': [ './zoomboard/src/keys.js' ],
          './zoomboard/main.min.js': [ './zoomboard/src/main.js' ],
        }
      },
      callout: {
        options: {
          sourceMap: DEBUG,
          banner: '/*! <%= pkg.name %> Callout keyboard <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          './callout/keys.min.js': [ './callout/src/keys.js' ],
          './callout/kbd.min.js': [ './callout/src/kbd.js' ],
          './callout/main.min.js': [ './callout/src/main.js' ],
        }
      },
      zshift: {
        options: {
          sourceMap: DEBUG,
          banner: '/*! <%= pkg.name %> ZShift keyboard <%= grunt.template.today("yyyy-mm-dd") %> */'
        },
        files: {
          './zshift/keys.min.js': [ './zshift/src/keys.js' ],
          './zshift/kbd.min.js': [ './zshift/src/kbd.js' ],
          './zshift/main.min.js': [ './zshift/src/main.js' ],
        }
      }
    },

    cssmin: {
      zoomboard: {
        options: {
          sourceMap: DEBUG,
        },
        files: {
          './zoomboard/styles.min.css': [ './zoomboard/src/styles.css' ]
        }
      },
      callout: {
        options: {
          sourceMap: DEBUG,
        },
        files: {
          './callout/styles.min.css': [ './callout/src/styles.css' ]
        }
      },
      zshift: {
        options: {
          sourceMap: DEBUG,
        },
        files: {
          './zshift/styles.min.css': [ './zshift/src/styles.css' ]
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', [
    'uglify:common',
    'uglify:zoomboard', 'cssmin:zoomboard',
    'uglify:callout', 'cssmin:callout',
    'uglify:zshift',  'cssmin:zshift'
  ]);

  grunt.registerTask('common', [
    'uglify:common'
  ]);

  grunt.registerTask('zoomboard', [
    'uglify:zoomboard', 'cssmin:zoomboard'
  ]);

  grunt.registerTask('callout', [
    'uglify:callout', 'cssmin:callout'
  ]);

  grunt.registerTask('zshift', [
    'uglify:zshift', 'cssmin:zshift'
  ]);

};
