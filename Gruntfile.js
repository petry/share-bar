/*global require, module:false */
module.exports = function(grunt) {
    var distJs = 'dist/js/',
        distCss = 'dist/css/';

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',

        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            js: {
                src: ['src/js/*.js'],
                dest: distJs + '<%= pkg.name %>.js'
            },
            css: {
                src: ['src/css/*.css'],
                dest: distCss + '<%= pkg.name %>.css'
            }
        },

        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            dist: {
                src: '<%= concat.js.dest %>',
                dest: distJs + '<%= pkg.name %>.min.js'
            }
        },

        cssmin: {
            minify: {
                src: 'dist/css/glb.share.css',
                dest: 'dist/css/glb.share.min.css',
                banner: '<%= banner %>'
            }
        },

        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {}
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            test: {
                src: ['<%= concat.js.src %>', 'tests/*.spec.js']
            }
        },

        compass: {
            dist: {
                options: {
                    sassDir: 'src/sass',
                    cssDir: 'src/css',
                    outputStyle: 'compressed',
                    noLineComments: true,
                    relativeAssets: true

                }
            }
        },

        svgstore: {
            options: {
                prefix : 'icon-',
            },
            default: {
                files: {
                    'dist/img/icons.svg': ['src/img/*.svg'],
                }
            }
        },

        svgmin: {
            options: {
                plugins: [
                    { removeViewBox: false },
                    { cleanupIDs: false }
                ]
            },
            dist: {
                files: {
                    'dist/img/icons.svg': 'dist/img/icons.svg'
                }
            }
        },

        'string-replace': {
            dist: {
                files: {
                    'dist/js/glb.share.js': 'dist/js/glb.share.js'
                },
                options: {
                    replacements: [{
                        pattern: '[[X_SVG_X]]',
                        replacement: grunt.file.read('dist/img/icons.svg'),
                    }]
                },
            }
        },

        jasmine: {
            share: {
                src: 'src/js/share.js',
                options: {
                    specs: 'tests/*.spec.js',
                    vendor: [],
                    junit: {
                        path: 'tests/reports/',
                        consolidate: true
                    },
                    keepRunner: true,
                    template: require('grunt-template-jasmine-istanbul'),
                    templateOptions: {
                        coverage: 'tests/reports/coverage.json',
                        report: 'tests/reports'
                    },
                    // phantom options
                    '--web-security' : false,
                    '--local-to-remote-url-access' : true,
                    '--ignore-ssl-errors' : true
                }
            }
        },

        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jstest']
            },
            buildJS: {
                files: ['<%= concat.js.src %>'],
                tasks: ['js']
            },
            buildCSS: {
                files: ['src/sass/*.scss'],
                tasks: ['css']
            },
            buildIcons: {
                files: ['src/img/*.svg'],
                tasks: ['icon']
            }
        },

        connect: {
            server: {
               options: {
                    port: 9002,
                    base: '.',
                    livereload: true
               }
            }
        },

        webfont: {
            icons: {
                src: 'src/img/*.svg',
                dest: 'src/fonts',
                destCss: 'src/sass',
                options: {
                    font: 'share-icon',
                    hashes: false,
                    htmlDemo: false,
                    stylesheet: 'scss',
                    embed: ['woff', 'ttf'],
                    templateOptions: {
                        baseClass: 'share-font',
                        classPrefix: 'ico-share-',
                        mixinPrefix: 'ico-share-'
                    },
                    types: 'woff,ttf'
                }
            },
        },

        buddyjs: {
            src: ['<%= concat.js.src %>'],
            options: {}
        },

        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'Release version: %VERSION%',
                commitFiles: ['package.json'],
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: 'Version %VERSION%',
                push: true,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-compass');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-webfont');
    grunt.loadNpmTasks('grunt-svgstore');
    grunt.loadNpmTasks('grunt-string-replace');
    grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-buddyjs');
    grunt.loadNpmTasks('grunt-bump');

    // Custom tasks
    grunt.registerTask('icon', ['svgstore', 'webfont', 'svgmin', 'string-replace']);
    grunt.registerTask('jstest', ['jshint', 'buddyjs', 'jasmine']);
    grunt.registerTask('js', ['concat:js','string-replace', 'uglify']);
    grunt.registerTask('css', ['compass', 'concat:css','cssmin']);

    // Default task.
    grunt.registerTask('default', ['icon', 'jstest', 'js', 'css']);
    grunt.registerTask('server', ['connect:server', 'watch']);
};
