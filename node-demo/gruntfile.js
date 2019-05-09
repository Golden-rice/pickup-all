module.exports = function(grunt){
  // 任务分配
  grunt.initConfig({
    watch: { // watch插件
      jade: {  
        files: ['views/**'],
        options: {
          livereload: true// 文件改动时重启服务
        }
      },
      js: {
        files: ['public/js/**', 'models/**/*.js', 'schemas/**/*.js'], // 监听文件
        tasks: ['jshint'], // 语法检车
        options: {
          livereload: true // 文件改动时重启服务
        }
      }
    },
    nodemon: {
      dev: {
        options: {
          file: 'app.js',
          args: [],
          ignoredFiles: ['README.md', 'node_modules/**', '.DS_Store'],
          watchedExtensions: ['js'],
          watchedFolders: ['./'], // 需要监听的目录
          debug: true,
          delayTime: 1,//如果大批量文件改动，便不每次改动都重启，而是等待一定时间再重启
          env: {
            PORT: 3000
          },
          cwd: __dirname
        }
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: ['test/**/*.js']
    },

    jshint: {
      options: {
        // jshintrc: '.jshintrc',
        ignores: ['public/libs/**/*.js']
      },
      all: ['public/js/*.js', 'test/**/*.js', 'app/**/*.js']
    },
    
    less: {
      development: { // 开发环境
        options: {
          compress: true,  // 是否开启压缩
          yuicompress: true, // 压缩方式
          optimization: 2
        },
        files: { // 生成文件：源文件 build 是以后部署到线上的文件
          'public/build/index.css': 'public/less/index.less' 
        }
      }
    },

    uglify: { // js压缩
      development: {
        files: { // 生成文件：源文件
          'public/build/admin.min.js': 'public/js/admin.js',
          'public/build/detail.min.js': [ // 将多个文件[数组]压缩成一个文件
            'public/js/detail.js'
          ]
        }
      }
    },

    concurrent: { // concurrent 插件
      tasks: ['watch', 'nodemon', 'less', 'jshint', 'uglify'],
      options: {
        logConcurrentOutput: true
      }
    }
  })

  // 加载插件和任务
  grunt.loadNpmTasks('grunt-contrib-watch') // 文件增删改查，重新执行注册的任务
  grunt.loadNpmTasks('grunt-nodemon') // 实时监听入口文件 app.js，自动重启 
  grunt.loadNpmTasks('grunt-concurrent')// 编译想less sass这样的慢任务，优化构建时间；同时跑多个像nodemon watch这样阻塞的任务
  grunt.loadNpmTasks('grunt-mocha-test') // 测试
  grunt.loadNpmTasks('grunt-contrib-less') // less编译
  grunt.loadNpmTasks('grunt-contrib-uglify') // js压缩合并
  grunt.loadNpmTasks('grunt-contrib-jshint') // jshint 规范检查

  // 默认执行列表
  grunt.option('force', true) // 忽略warning错误，防止引起的阻塞
  grunt.registerTask('default', ['concurrent']) // 注册服务
  grunt.registerTask('test', ['mochaTest'])
} 