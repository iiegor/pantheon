var path = require('path');

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    _tmpDir: path.resolve('.tmp'),
    _assetsDir: path.resolve('app', 'assets'),
    _publicDir: path.resolve('public'),

    less: {
      production: {
        files: {
            '<%= _tmpDir %>/assets/style.css': '<%= _assetsDir %>/stylesheets/*.less'
        }
      }
    },

    cssmin: {
      production: {
        files: {
          '<%= _publicDir %>/assets/style.min.css': ['.tmp/assets/style.css']
        }
      }
    },

    browserify: {
      production: {
        files: {
         '<%= _publicDir %>/assets/app.min.js': '<%= _assetsDir %>/javascripts/application.js',
        },

        options: {
          transform: ['uglifyify']
        }
      }
    },

    clean: {
      tmp: {
        src: ["<%= _tmpDir %>/"]
      }
    },

    shell: {
      server: {
        options: {
          async: true
        },
        command: 'node app.js'
      }
    },

    watch: {
      stylesheets: {
        files: ["<%= _assetsDir %>/stylesheets/*.less"],
        tasks: ['less:production', 'cssmin:production', 'clean:tmp']
      },

      javascripts: {
        files: ["<%= _assetsDir %>/javascripts/*.js"],
        tasks: ['uglify:production']
      }
    },

    gettext_finder: {
      files: ['app/views/**/*.html'],
      options: {
        pathToJSON: ['locales/en_US/*.json'],
        ignoreKeys: grunt.file.readJSON('gtf-ignored-keys.json')
      }
    }
  });

  // Tasks
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['less:production', 'cssmin:production', 'browserify:production', 'clean:tmp']);

  grunt.registerTask('server:prod', ['build', 'shell:server']);
  grunt.registerTask('server:dev', ['build', 'shell:server', 'watch']);
};
