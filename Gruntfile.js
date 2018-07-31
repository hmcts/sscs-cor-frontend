module.exports = grunt => {
  grunt.initConfig({

    // Covert Sass to CSS
    sass: {
      dev: {
        options: {
          style: 'expanded',
          sourcemap: true,
          includePaths: [
            'govuk_modules/govuk_template/assets/stylesheets',
            'govuk_modules/govuk_frontend_toolkit/stylesheets',
            'govuk_modules/govuk-elements-sass/'
          ],
          outputStyle: 'expanded'
        },
        files: [
          {
            expand: true,
            cwd: 'app/assets/sass/',
            src: ['*.scss'],
            dest: 'public/stylesheets/',
            ext: '.css'
          }
        ]
      }
    },

    // Copy over GOV.UK and assets.
    sync: {
      assets: {
        files: [
          {
            expand: true,
            cwd: 'app/assets/',
            src: ['**/*', '!sass/**'],
            dest: 'public/'
          }
        ],
        ignoreInDest: '**/stylesheets/**',
        updateAndDelete: true
      },
      govuk: {
        files: [
          {
            cwd: 'node_modules/govuk_frontend_toolkit/',
            src: '**',
            dest: 'govuk_modules/govuk_frontend_toolkit/'
          },
          {
            cwd: 'node_modules/govuk_template_jinja/assets/',
            src: '**',
            dest: 'govuk_modules/govuk_template/assets/'
          },
          {
            cwd: 'node_modules/govuk_template_jinja/views/layouts/',
            src: '**',
            dest: 'govuk_modules/govuk_template/views/layouts/'
          },
          {
            cwd: 'node_modules/govuk-elements-sass/public/sass/',
            src: [
              '**', '!node_modules',
              '!elements-page.scss',
              '!elements-page-ie6.scss',
              '!elements-page-ie7.scss',
              '!elements-page-ie8.scss',
              '!main.scss',
              '!main-ie6.scss',
              '!main-ie7.scss',
              '!main-ie8.scss',
              '!prism.scss'
            ],
            dest: 'govuk_modules/govuk-elements-sass/'
          }
        ]
      },
      govuk_template_jinja: {
        files: [
          {
            cwd: 'govuk_modules/govuk_template/views/layouts/',
            src: '**',
            dest: 'lib/'
          }, {
            cwd: 'govuk_modules/govuk_template/assets/javascripts',
            src: 'govuk-template.js',
            dest: 'public/javascripts'
          }
        ]
      },
      google_analytics: {
        files: [
          {
            cwd: 'govuk_modules/govuk_frontend_toolkit/javascripts/govuk/analytics',
            src: [
              'google-analytics-universal-tracker.js',
              'analytics.js',
              'govuk-tracker.js'
            ],
            dest: 'public/javascripts'
          }
        ]
      }
    },
    copy: {
      services: {
        src: 'app/assets/javascripts/index.js',
        dest: 'app/services/index.js'
      },
      mockServices: {
        src: 'test/mock/index.js',
        dest: 'app/services/index.js'
      }
    },

    // Watches assets and sass for changes
    watch: {
      css: {
        files: ['app/assets/sass/**/*.scss'],
        tasks: ['sass'],
        options: { spawn: false }
      },
      assets: {
        files: ['app/assets/**/*', '!app/assets/sass/**'],
        tasks: ['sync:assets'],
        options: { spawn: false }
      }
    },

    // nodemon watches for changes and restarts app
    nodemon: {
      dev: {
        script: 'server.js',
        options: {
          ext: 'js, json',
          ignore: ['node_modules/**', 'app/assets/**', 'public/**'],
          args: grunt.option.flags()
        }
      }
    },

    concurrent: {
      target: {
        tasks: ['watch', 'nodemon'],
        options: { logConcurrentOutput: true }
      }
    },

    nsp: { package: grunt.file.readJSON('package.json') }
  });

  [
    'grunt-nsp',
    'grunt-sync',
    'grunt-contrib-watch',
    'grunt-contrib-copy',
    'grunt-sass',
    'grunt-nodemon',
    'grunt-concurrent'
  ].forEach(task => {
    grunt.loadNpmTasks(task);
  });

  grunt.registerTask('dev', [
    'generate-assets',
    'concurrent:target'
  ]);

  grunt.registerTask('dev-mock-services', [
    'sync',
    'sass',
    'copy:mockServices',
    'concurrent:target'
  ]);

  grunt.registerTask('generate-assets', [
    'sync',
    'sass',
    'copy:services'
  ]);

  grunt.registerTask('mock-services', ['copy:mockServices']);
  grunt.registerTask('services', ['copy:services']);
  grunt.registerTask('security-checks', ['nsp:package']);
};
