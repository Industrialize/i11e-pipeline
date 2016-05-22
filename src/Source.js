const _ = require('./prodline');
const Box = require('i11e-box');

class Stream {
  constructor() {
    const EventEmitter = require('eventemitter3');
    this.buffer = new EventEmitter();
  }

  push(box) {
    this.buffer.emit('box', box);
  }

  toGenerator() {
    return _('box', this.buffer);
  }
}

// stream implemented with ArrayList
// class Stream {
//   constructor() {
//     this.buffer = [];
//   }
//
//   push(box) {
//     this.buffer.push(box);
//   }
//
//   toGenerator() {
//     return _((push, next) => {
//       if (this.buffer.length > 0) {
//         push(null, this.buffer.shift());
//       }
//
//       process.nextTick(next);
//     });
//   }
// }

// stream implemented with PassThrough
// class Stream {
//   constructor() {
//     const PassThrough = require('stream').PassThrough;
//     this.buffer = new PassThrough({
//       objectMode: true
//     });
//   }
//
//   push(box) {
//     this.buffer.push(box);
//   }
//
//   toGenerator() {
//     return _(this.buffer);
//   }
// }

/**
 * Production line source
 */
class Source {
  /**
   * Construct a production line source
   *
   * @param  {Object} options See highland _(source) method
   * @return {Source}         instance of source
   */
  constructor(options) {
    this.options = options;

    if (!this.options) {
      this.streams = [];
    }
  }

  /**
   * Get the production line (highland Stream), it returns a new forked
   * highland stream when being called.
   * @return {Stream} highland stream
   */
  getProdline() {
    let stream = new Stream();
    this.streams.push(stream);
    if (!this.options) return stream.toGenerator().fork();
    return _(this.options).fork();
  }

  /**
   * A short name for getProdline, the tail of the source
   * @return {Stream} highland stream
   */
  _() {
    return this.getProdline();
  }

  /**
   * Push new box to the production line, this method is ONLY available,
   * when options is null or undefined. Otherwise, it does nothing but
   * print a warning message
   *
   * @param  {Box} box the box to be put on the production line
   * @return {Source}     source itself
   */
  push(box) {
    if (!Box.isBox(box)) box = new Box(box);

    if (!this.options) {
      for (let stream of this.streams) {
        stream.push(new Box(box));  // duplicate the box
      }
    } else {
      console.warn('Can NOT "push" box to a finite production line');
    }

    return this;
  }
}

module.exports = Source;
