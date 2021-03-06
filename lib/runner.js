// https://github.com/tim-smart/node-closure/blob/master/lib/index.js

var JAR_PATH, JAVA_PATH, OPTIONS, path, spawn;

spawn = require('child_process').spawn;

path = require('path');

JAVA_PATH = exports.JAVA_PATH = 'java';

JAR_PATH = exports.JAR_PATH = require.resolve('google-closure-compiler/compiler.jar');

OPTIONS = exports.OPTIONS = {};

exports.compile = function(input, options, callback) {
  var args, compiler, result, stderr, stdout;
  if ('function' === typeof options) {
    callback = options;
    options = OPTIONS;
  } else {
    result = {};
    Object.keys(OPTIONS).forEach(function(key) {
      return result[key] = OPTIONS[key];
    });
    Object.keys(options).forEach(function(key) {
      return result[key] = options[key];
    });
    options = result;
  }
  args = [];
  if (!options.jar) {
    options.jar = JAR_PATH;
  }
  args.push('-jar');
  args.push(options.jar);
  delete options.jar;
  Object.keys(options).forEach(function(key) {
    var val, value, _i, _len;
    value = options[key];
    if (Array.isArray(value)) {
      for (_i = 0, _len = value.length; _i < _len; _i++) {
        val = value[_i];
        args.push("--" + key);
        args.push(val);
      }
      return;
    }
    args.push("--" + key);
    return args.push(value);
  });
  compiler = spawn(JAVA_PATH, args);
  stdout = '';
  stderr = '';
  compiler.stdout.setEncoding('utf8');
  compiler.stderr.setEncoding('utf8');
  compiler.stdout.on('data', function(data) {
    return stdout += data;
  });
  compiler.stderr.on('data', function(data) {
    return stderr += data;
  });
  compiler.on('close', function(code) {
    var error;
    if (code !== 0) {
      error = new Error(stderr);
      error.code = code;
    } else {
      error = null;
    }
    return callback(error, stdout, stderr);
  });
  return compiler.stdin.end(input);
};
