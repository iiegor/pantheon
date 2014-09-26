module.exports = function (grunt) {

  grunt.initConfig({
    less: {
      development: {
        files: {
          'public/compiled/style.css': 'public/css/*.less'
        }
      }
    },
    cssmin: {
      my_target: {
        files: [{
          expand: true,
          cwd: 'public/compiled/',
          src: ['style.css', '!style.min.css'],
          dest: 'public/compiled/',
          ext: '.min.css'
        }]
      }
    },
    watch: {
      less: {
        files: ['public/css/**/*.less'],
        tasks: ['less:development']
      }
    },
    shell: {
      runServer: {
        options: {
          async: true
        },
        command: 'node app.js'
      }
    },
    jshint: {
      all: ['Gruntfile.js', 'public/js/**/*.js'],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    jsbeautifier: {
      modify: {
        src: ['Gruntfile.js', 'public/js/**/*.js'],
        options: {
          config: '.jsbeautifyrc'
        }
      },
      validate: {
        src: ['Gruntfile.js', 'public/js/**/*.js'],
        options: {
          mode: 'VERIFY_ONLY',
          config: '.jsbeautifyrc'
        }
      }
    },
    gettext_finder: {
      files: ["views/*.html", "views/**/*.html"],
      options: {
        pathToJSON: ["locale/en_US/*.json"],
        ignoreKeys: grunt.file.readJSON("gtf-ignored-keys.json")
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-jsbeautifier');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default', ['less', 'cssmin']);

  // Run server
  grunt.registerTask('deploy', ['default', 'shell:runServer', 'watch']);

  // Clean code before a commit
  grunt.registerTask('clean', ['jsbeautifier:modify', 'jshint']);

  // Validate code (read only)
  grunt.registerTask('validate', ['jsbeautifier:validate', 'jshint']);

  // Heroku
  grunt.registerTask('heroku', ['less']);

};