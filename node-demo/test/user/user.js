var crypto = require('crypto');
var bcrypt = require('bcryptjs');

function getRandomString(len) {
  if (!len) len = 16;

  return crypto.randomBytes(Math.ceil(len / 2)).toString('hex');
}

var should = require('should');
var app = require('../../app');
// var User = require('../../app/models/user')
var mongoose = require('mongoose');
var User = mongoose.model('User');



// test
describe('<Unit Test', function() {
  describe('Model User:', function() {
    before(function(done) {
      user = { // 全局变量
        name: getRandomString(), // 随机16位字符串
        password: 'password' // 一段假密码
      };

      done(); // 启动测试
    });

    describe('Before Method save', function() {
      // 随机生成的用户名不存在
      // it() 相当于一个测试单元
      it('should begin without test user', function(done) {
        User.find({name: user.name}, function(err, users) {
          users.should.have.length(0);

          done();
        });
      });
    });

    describe('User save', function() {
      // 存储时无问题
      it('should save without problems', function(done) {
        var _user = new User(user); // user实例化

        _user.save(function(err) {
          should.not.exist(err); // err = true; 则停止执行
          _user.remove(function(err) { // 删除该_user 
            should.not.exist(err);
            done();
          });
        });
      });

      // 验证密码规则
      it('should password be hashed correctly', function(done) {
        var password = user.password; // console.log(password)
        var _user = new User(user);

        _user.save(function(err) {
          should.not.exist(err);
          _user.password.should.not.have.length(0); // 生成密码成功

          // 数据库密码和当前用户密码加盐后是否可验证
          bcrypt.compare(password, _user.password, function(err, isMatch) {
            should.not.exist(err);
            isMatch.should.equal(true);

            // 删除改_user
            _user.remove(function(err) { 
              should.not.exist(err);
              done();
            });
          });
        });
      });

      // 测试权限默认为0
      it('should have default role 0', function(done) {
        var _user = new User(user);

        _user.save(function(err) {
          _user.role.should.equal(0); // 权限=0

          _user.remove(function(err) {
            done();
          });
        });
      });


      // 创建的user不重名，Model中的unique规则
      it('should fail to save an existing user', function(done) {
        var _user1 = new User(user);

        _user1.save(function(err) {
          should.not.exist(err);

          var _user2 = new User(user);

          _user2.save(function(err) {
            should.exist(err);

            _user1.remove(function(err) {
              if (!err) {
                _user2.remove(function(err) {
                  done();
                });
              }
            });
          });
        });
      });

      
    });

    // 测试完成后
    after(function(done) {
      // clear user info
      done();
    });
  });
});