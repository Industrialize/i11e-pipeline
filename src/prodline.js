const _ = require('./highland');

const DEFAULT_PARALLEL = 3;

const createError = require('i11e-utils').error;

function install(comment, robot, parallel) {
  if (typeof comment !== 'string') {
    parallel = robot || DEFAULT_PARALLEL;
    robot = comment;
  }

  if (robot.isFilter()) {
    return this.filter(robot.process(box));
  } else {
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
        .through(
          _.pipeline(
            _.map(_.wrapCallback(fn)),
            _.parallel(parallel)
          )
        );
    }
  }
};

function drive(fn) {
  if (!fn) fn = (box) => {};
  return this.each(fn);
}

_.addMethod('install', install);
_.addMethod('next', install);
_.addMethod('drive', drive);

module.exports = _;
