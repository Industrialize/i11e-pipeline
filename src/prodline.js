const _ = require('./highland');

const DEFAULT_PARALLEL = 3;

const createError = require('i11e-utils').error;
const Robot = require('i11e-robot');

_.addMethod('install', function(comment, robot, parallel) {
  if (Robot.isRobot(comment)) {
    parallel = robot || DEFAULT_PARALLEL;
    robot = comment;
  }

  if (robot.isSync()) {
    var fn = (box) => {
      try {
        return robot.process(box);
      } catch (err) {
        throw createError(500, err, box);
      }
    };

    return this.filter(robot.filter.bind(robot)).map(fn);
  } else {
    var fn = (box, done) => {
      try {
        return robot.process(box, done);
      } catch (err) {
        throw createError(500, err, box);
      }
    };

    if (!parallel) parallel = DEFAULT_PARALLEL;

    return this
      .filter(robot.filter.bind(robot))
      .through(
        _.pipeline(
          _.map(_.wrapCallback(fn)),
          _.parallel(parallel)
        )
      );
  }
});

_.addMethod('drive', function(fn) {
  if (!fn) fn = (box) => {};
  return this.each(fn);
});

module.exports = _;
