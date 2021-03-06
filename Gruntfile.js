'use strict';
var path = require('path');

var folderMount = function folderMount(connect, point) {
  return connect.static(path.resolve(point[0]));
};

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    connect: {
      main: {
        options: {
          port: 9001,
          middleware: function(connect, options) {
            return [folderMount(connect, options.base)]
          }
        }
      }
    },
    watch: {
      options: {
          livereload: true
      },
      server: {
        files: ['js/**/*','css/**/*','img/**/*','partial/**/*','service/**/*','filter/**/*','directive/**/*','index.html'],
        tasks: []
      },
      test: {
        files: ['js/**/*','partial/**/*.js','service/**/*.js','filter/**/*.js','directive/**/*.js','index.html','test/unit/**/*'],
        tasks: ['test']
      }
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: ['js/**/*.js','partial/**/*.js','service/**/*.js','filter/**/*.js','directive/**/*.js']
    },
    clean: {
      before:{
        src:['dist','temp']
      },
      after: {
        src:['temp']
      }
    }, 
    less: {
      production: {
        options: {
        },
        files: {
          "temp/app.css": "css/app.less"
        }
      }
    },         
    ngtemplates: {
      main: {
        options: {
            module:'ingr-web'
        },
        src: [ 'partial/**/*.html','directive/**/*.html' ],
        dest: 'temp/templates.js'
      }
    },
    copy: {
      main: {
        files: [
          {src: ['index.html'], dest: 'dist/'},
          {src: ['img/**'], dest: 'dist/'},
          {src: ['bower_components/font-awesome/fonts/*.woff'], dest: 'dist/fonts/fontawesome-webfont.woff'},
          {src: ['bower_components/font-awesome/fonts/*.ttf'], dest: 'dist/fonts/fontawesome-webfont.ttf'}
        ]
      },
      fonts: {
        files: [
          {src: ['bower_components/font-awesome/fonts/fontawesome-webfont.woff'], dest: 'fonts/fontawesome-webfont.woff'},
          {src: ['bower_components/font-awesome/fonts/fontawesome-webfont.ttf'], dest: 'fonts/fontawesome-webfont.ttf'}
        ]
      }
    },
    dom_munger:{
      readscripts: {
        options: {
          read:{selector:'script[data-build!="exclude"]',attribute:'src',writeto:'appjs'}
        },
        src:'index.html'
      },
      readcss: {
        options: {
          read:{selector:'link[rel="stylesheet"]',attribute:'href',writeto:'appcss'}
        },
        src:'index.html'
      },
      removescripts: {
        options:{
          remove:'script[data-remove!="exclude"]'//,
          //append:{selector:'head',html:'<script src="app.full.min.js"></script>'}
        },
        src:'dist/index.html'
      }, 
      addscript: {
        options:{
          append:{selector:'body',html:'<script src="app.full.min.js"></script>'}
        },
        src:'dist/index.html'
      },       
      removecss: {
        options:{
          remove:'link',
          append:{selector:'head',html:'<link rel="stylesheet" href="css/app.full.min.css">'}
        },
        src:'dist/index.html'
      },
      addcss: {
        options:{
          append:{selector:'head',html:'<link rel="stylesheet" href="css/app.full.min.css">'}
        },
        src:'dist/index.html'
      }
    },
    cssmin: {
      main: {
        src:['temp/app.css','<%= dom_munger.data.appcss %>'],
        dest:'dist/css/app.full.min.css'
      }
    },
    concat: {
      main: {
        src: ['<%= dom_munger.data.appjs %>','<%= ngtemplates.main.dest %>'],
        dest: 'temp/app.full.js'
      }
    },
    ngmin: {
      main: {
        src:'temp/app.full.js',
        dest: 'temp/app.full.js'
      }
    },
    uglify: {
      main: {
        src: 'temp/app.full.js',
        dest:'dist/app.full.min.js'
      }
    },
    htmlmin: {
      main: {
        options: {
          removeComments: true,
          collapseWhitespace: true
        },
        files: {
          'dist/index.html': 'dist/index.html'
        }
      }
    },
    imagemin: {
      main:{
        files: [{
          expand: true, cwd:'dist/',
          src:['**/{*.png,*.jpg}'],
          dest: 'dist/'
        }]
      }
    },
    mocha: {
      test: {
        src: ['test/unit/*.html'],
        options: {
          run: true
        }
      }
    },
    'sftp-deploy': {
      stage: {
        auth: {
          host: 'instagrannar.se',
          port: 22,
          authKey: 'GRUNT_SFTP'
        },
        src: 'dist',
        dest: '/var/www/stage.instagrannar.se',
        concurrency: 1,
        progress: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-angular-templates');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-dom-munger');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-sftp-deploy');

  grunt.registerTask('build',['clean:before','less','dom_munger:readcss','dom_munger:readscripts','ngtemplates','cssmin','concat','ngmin','uglify','copy:main', 'copy:fonts','dom_munger:removecss','dom_munger:addcss','dom_munger:removescripts','dom_munger:addscript','htmlmin','imagemin','clean:after']);
  grunt.registerTask('test',['jshint', 'mocha']);
  grunt.registerTask('server', ['connect']);
  grunt.registerTask('release', ['build', 'sftp:production']);
  grunt.registerTask('stage', ['build', 'sftp-deploy:stage']);
  grunt.registerTask('default', ['test', 'server', 'copy:fonts', 'watch']);
};
