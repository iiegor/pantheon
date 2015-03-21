var path = require('path');

module.exports = function (grunt) {
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

    uglify: {
      production: {
        files: {
          "<%= _publicDir %>/assets/app.min.js": ["<%= _assetsDir %>/javascripts/*.js"]
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

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell-spawn');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Tasks
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['less:production', 'cssmin:production', 'uglify:production', 'clean:tmp']);

  grunt.registerTask('server:prod', ['build', 'shell:server']);
  grunt.registerTask('server:dev', ['build', 'shell:server', 'watch']);
};
