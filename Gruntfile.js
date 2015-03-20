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
    uglify: {
      my_target: {
        files: {
          'public/compiled/app.min.js': ['public/js/*.js']
        }
      }
    },
    gettext_finder: {
      files: ['views/*.html', 'views/**/*.html'],
      options: {
        pathToJSON: ['locale/en_US/*.json'],
        ignoreKeys: grunt.file.readJSON('gtf-ignored-keys.json')
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default
  grunt.registerTask('default', ['less', 'cssmin', 'uglify']);

  // Run server
  grunt.registerTask('deploy', ['default', 'shell:runServer', 'watch']);

  // Heroku
  grunt.registerTask('heroku', ['less']);

};
